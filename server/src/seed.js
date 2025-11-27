import { db, initDb } from "./db.js";
import { hashPassword } from "./utils.js";

initDb();

function run(sql, params = []) {
  return new Promise((res, rej) =>
    db.run(sql, params, function (err) {
      if (err) rej(err);
      else res(this);
    })
  );
}

function get(sql, params = []) {
  return new Promise((res, rej) =>
    db.get(sql, params, (err, row) => (err ? rej(err) : res(row)))
  );
}

(async () => {
  // ===== Roles =====
  await run(
    `INSERT OR IGNORE INTO roles(name)
     VALUES ('Donor'),('Beneficiary'),('Organizer'),('Admin')`
  );

  // ===== Users =====
  const users = [
    {
      name: "Admin",
      surname: "Root",
      dni: "10000000",
      birthdate: "1980-01-01",
      sex: "M",
      email: "admin@demo.com",
      phone: "111111",
      address: "Calle 1",
      password: "Admin1234",
    },
    {
      name: "Olivia",
      surname: "Organizadora",
      dni: "20000000",
      birthdate: "1990-01-01",
      sex: "F",
      email: "org@demo.com",
      phone: "222222",
      address: "Calle 2",
      password: "Org12345",
    },
    {
      name: "Diego",
      surname: "Donante",
      dni: "30000000",
      birthdate: "1995-06-15",
      sex: "M",
      email: "donor@demo.com",
      phone: "333333",
      address: "Calle 3",
      password: "Donor123",
    },
    {
      name: "Bea",
      surname: "Beneficiaria",
      dni: "40000000",
      birthdate: "1992-04-10",
      sex: "F",
      email: "benef@demo.com",
      phone: "444444",
      address: "Calle 4",
      password: "Benef1234",
    },
  ];

  for (const u of users) {
    const exists = await get(`SELECT id FROM users WHERE email=?`, [u.email]);
    if (!exists) {
      const ins = await run(
        `INSERT INTO users(name,surname,dni,birthdate,sex,email,phone,address,password_hash)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          u.name,
          u.surname,
          u.dni,
          u.birthdate,
          u.sex,
          u.email,
          u.phone,
          u.address,
          hashPassword(u.password),
        ]
      );

      const uid = ins.lastID;

      // Roles según tipo
      if (u.email.startsWith("admin"))
        await run(
          `INSERT INTO user_roles(user_id,role_id)
           SELECT ?, id FROM roles WHERE name='Admin'`,
          [uid]
        );

      if (u.email.startsWith("org"))
        await run(
          `INSERT INTO user_roles(user_id,role_id)
           SELECT ?, id FROM roles WHERE name='Organizer'`,
          [uid]
        );

      if (u.email.startsWith("benef"))
        await run(
          `INSERT INTO user_roles(user_id,role_id)
           SELECT ?, id FROM roles WHERE name='Beneficiary'`,
          [uid]
        );

      // Todos son donantes
      await run(
        `INSERT INTO user_roles(user_id,role_id)
         SELECT ?, id FROM roles WHERE name='Donor'`,
        [uid]
      );
    }
  }

  // ===== Centers =====
  const centers = [
    [
      "Hospital Durand",
      "Av. Díaz Vélez 5044",
      "L-V 08:00–16:00",
      -34.611,
      -58.44,
      40,
    ],
    ["UBA Medicina", "Paraguay 2155", "L-V 09:00–17:00", -34.599, -58.396, 50],
    ["Fundación Hemo", "Moreno 3453", "L-S 08:00–14:00", -34.615, -58.406, 60],
  ];

  for (const c of centers) {
    await run(
      `INSERT OR IGNORE INTO centers(name,address,hours,lat,lng,capacity)
       VALUES (?,?,?,?,?,?)`,
      c
    );
  }

  // ===== Campaigns =====
  const org = await get(
    `SELECT id FROM users WHERE email='org@demo.com'`
  );
  const center1 = await get(
    `SELECT id FROM centers WHERE name='Hospital Durand'`
  );
  const center2 = await get(
    `SELECT id FROM centers WHERE name='UBA Medicina'`
  );

  // Inserción idempotente por (name, date) para evitar solapamiento del trigger al re-seed
  const camp1Exists = await get(
    `SELECT id FROM campaigns WHERE name=? AND date=?`,
    ["Colecta Primavera", "2025-11-22"]
  );
  if (!camp1Exists) {
    await run(
      `INSERT INTO campaigns
       (name, place, center_id, date, start_time, end_time,
        blood_group, rh_factor, notes, capacity, organizer_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        "Colecta Primavera",
        "Salón principal del Durand",
        center1.id,
        "2025-11-22",
        "08:00",
        "14:00",
        "O",
        "Rh+",
        "Sin antibióticos",
        40,
        org.id,
      ]
    );
  }

  const camp2Exists = await get(
    `SELECT id FROM campaigns WHERE name=? AND date=?`,
    ["Campaña Universitaria", "2025-11-23"]
  );
  if (!camp2Exists) {
    await run(
      `INSERT INTO campaigns
       (name, place, center_id, date, start_time, end_time,
        blood_group, rh_factor, notes, capacity, organizer_id)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        "Campaña Universitaria",
        "Hall central UBA Medicina",
        center2.id,
        "2025-11-23",
        "09:00",
        "17:00",
        "A",
        "Rh-",
        "",
        50,
        org.id,
      ]
    );
  }

  // ===== Health Form =====
  const donor = await get(
    `SELECT id FROM users WHERE email='donor@demo.com'`
  );

  const hasHF = await get(
    `SELECT id FROM health_forms WHERE user_id=? LIMIT 1`,
    [donor.id]
  );
  if (!hasHF) {
    await run(
      `INSERT INTO health_forms
       (user_id, weight, diseases, medications, last_donation_date,
        blood_group, rh_factor, status)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        donor.id,
        68,
        "Ninguna",
        "",
        "2025-08-01",
        "O",
        "Rh+",
        "Apto",
      ]
    );
  }

  console.log("✅ Seed completado correctamente con nuevas columnas.");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
