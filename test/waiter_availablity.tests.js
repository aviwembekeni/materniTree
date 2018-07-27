"Use strict";
var assert = require("assert");
const pg = require("pg");
const Pool = pg.Pool;

let useSSL = false;
if (process.env.DATABASE_URL) {
  useSSL = true;
}

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://aviwe:aviwe@localhost:5432/waiter_availability_tests",
  ssl: useSSL
});

const WaiterAvailability = require("../waiter-availability");

describe("getWeekdays", function() {
  it("should return weekdays", async function() {
    let waiterAvail = WaiterAvailability(pool);

    const weekdays = [
      { id: 1, day_name: "Monday" },
      { id: 2, day_name: "Tuesday" },
      { id: 3, day_name: "Wednesday" },
      { id: 4, day_name: "Thursday" },
      { id: 5, day_name: "Friday" },
      { id: 6, day_name: "Saturday" },
      { id: 7, day_name: "Sunday" }
    ];

    assert.deepEqual(
      await waiterAvail.getWeekdays(),
      await waiterAvail.getWeekdays()
    );
  });
});

describe("addUser", function() {
  it("should add a user", async function() {
    let waiterAvail = WaiterAvailability(pool);

    await waiterAvail.addUser("klaus", "Nicklaus Mikaelson", "waiter");

    const user = await pool.query(
      "select user_name, full_name, user_type from users WHERE user_name = $1",
      ["klaus"]
    );

    assert.deepEqual(user.rows[0], {
      user_name: "klaus",
      full_name: "Nicklaus Mikaelson",
      user_type: "waiter"
    });
  });
});

describe("addShift", function() {
  it("should add shifts", async function() {
    let waiterAvail = WaiterAvailability(pool);

    await waiterAvail.addShift("johndoe", "Saturday");

    let results = await pool.query(
      "SELECT user_name, day_name FROM users JOIN shifts ON users.id = shifts.waiter_id JOIN weekdays ON shifts.weekday_id = weekdays.id WHERE user_name = $1 AND day_name = $2",
      ["johndoe", "Thursday"]
    );

    assert.notEqual(results.rowCount, 0);
  });

  describe("getUserType", function() {
    it("should return 'waiter'", async function() {
      let waiterAvail = WaiterAvailability(pool);

      await waiterAvail.addUser("klaus", "Nicklaus Mikaelson", "waiter");

      assert.equal(await waiterAvail.getUserType("klaus"), "waiter");
    });

    it("should return 'admin'", async function() {
      let waiterAvail = WaiterAvailability(pool);

      await waiterAvail.addUser("elijah", "Elijah Mikaelson", "admin");

      assert.equal(await waiterAvail.getUserType("elijah"), "admin");
    });
  });
});