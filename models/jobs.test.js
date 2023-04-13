"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 90000,
    equity: 0.90,
    company_handle: 'c1'
  };

  test("works", async function () {
    const job = await Job.create(newJob);
    const jobId = job.id;
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${jobId}`
    );
    expect(result.rows).toEqual([
      {
        id: jobId,
        title: "new",
        salary: 90000,
        equity: 0.90,
        company_handle: 'c1'
      }
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: 'j1',
        salary: 100000,
        equity: 0.98,
        company_handle: 'c1'
      },

      {
        title: 'j2',
        salary: 150000,
        equity: 0.95,
        company_handle: 'c2'
      }
    ]);
  });
});

/************************************** findByFilters */

describe("findByFilters", function () {
  test("works", async function () {
    const filters = {
      title: '1',
      minSalary: 80000,
      hasEquity: true
    };
    const jobs = await Job.findByFilters(filters);

    expect(jobs).toEqual([
      {
        title: 'j1',
        salary: 100000,
        equity: 0.98,
        company_handle: 'c1'
      }
    ]);
  });
  test("Returns empty array if no matching jobs", async function () {
    const filters = {
      title: '1',
      minSalary: 80000,
      hasEquity: false
    };
    const jobs = await Job.findByFilters(filters);

    expect(jobs).toEqual([]);
  });
  test("Works if we only pass in certain parameters", async function () {
    const filters = {
      title: 'j1'
    };
    const jobs = await Job.findByFilters(filters);

    expect(jobs).toEqual([
      {
        title: 'j1',
        salary: 100000,
        equity: 0.98,
        company_handle: 'c1'
      }
    ]);
  });
});

/************************************** get */

describe("get", async function () {
  test("works", async function () {
    const job = await Job.get(job2.id);
    expect(job).toEqual({
      title: 'j2',
      salary: 150000,
      equity: 0.95,
      company_handle: 'c2'
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: 'j2',
    salary: 200000,
    equity: 0.95,
    company_handle: 'c2'
  };

  test("works", async function () {
    const job = await Job.update(job2Id, updateData);
    expect(job).toEqual({
      id: job2Id,
      ...updateData,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job2Id}`
    );
    expect(result.rows).toEqual([
      {
        id: job2Id,
        title: 'j2',
        salary: 200000,
        equity: 0.95,
        company_handle: 'c2'
      }
    ]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      salary: 200000,
      equity: 0.95,
      company_handle: 'c2'
    };

    const job = await Job.update(job2Id, updateDataSetNulls);
    expect(job).toEqual({
      id: job2Id,
      ...updateDataSetNulls,
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = ${job2Id}`
    );
    expect(result.rows).toEqual([
      {
        id: job2Id,
        title: 'j2',
        salary: 200000,
        equity: 0.95,
        company_handle: 'c2'
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(job2Id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("bad request when changing company handle to non existant company",
    async function () {
      const updateData = {
        title: 'j2',
        salary: 200000,
        equity: 0.95,
        company_handle: 'nope'
      };

      try {
        await Job.update(job2Id, updateData);
        throw new Error("fail test, you shouldn't get here");
      } catch (err) {
        expect (err instanceof BadRequestError).toBeTruthy();
      }
    });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(job2Id);
    const res = await db.query(
      `SELECT id FROM jobs WHERE id=${job2Id}`
    );
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("nope");
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});