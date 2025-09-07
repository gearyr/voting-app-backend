const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");
const Vote = require("../models/Vote");

beforeAll(async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/voting_app_test");
  await User.deleteMany();
  await Vote.deleteMany();

  await request(app).post("/auth/register").send({
    username: "admin1",
    password: "123",
    role: "admin",
  });

  await request(app).post("/auth/register").send({
    username: "user1",
    password: "123",
    role: "user",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Voting Routes", () => {
  let userToken;
  let adminToken;

  it("logs in both user and admin", async () => {
    const user = await request(app).post("/auth/login").send({
      username: "user1",
      password: "123",
    });
    expect(user.statusCode).toBe(200);
    expect(user.body.token).toBeDefined();
    userToken = user.body.token;

    const admin = await request(app).post("/auth/login").send({
      username: "admin1",
      password: "123",
    });
    expect(admin.statusCode).toBe(200);
    expect(admin.body.token).toBeDefined();
    adminToken = admin.body.token;
  });

  it("rejects vote when not authenticated", async () => {
    const res = await request(app).post("/vote").send({ name: "Alice" });
    expect(res.statusCode).toBe(401);
  });

  it("allows an authenticated user to create a new vote (Alice -> 1)", async () => {
    const res = await request(app).post("/vote").set("Authorization", `Bearer ${userToken}`).send({ name: "Alice" });
    expect(res.statusCode).toBe(200);
    expect(res.body.vote).toBeDefined();
    expect(res.body.vote.name).toBe("Alice");
    expect(res.body.vote.votes).toBe(1);
  });

  it("increments existing vote when same name voted again (Alice -> 2)", async () => {
    const res = await request(app).post("/vote").set("Authorization", `Bearer ${userToken}`).send({ name: "Alice" });

    expect(res.statusCode).toBe(200);
    expect(res.body.vote.votes).toBe(2);
  });

  it("returns results sorted by votes", async () => {
    // add one vote for Bob
    await request(app).post("/vote").set("Authorization", `Bearer ${userToken}`).send({ name: "Bob" }); // Bob=1

    const res = await request(app).get("/vote/results");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // top result should be Alice (2 votes)
    expect(res.body[0].name).toBe("Alice");
    expect(res.body[0].votes).toBe(2);
  });

  it("admin summary returns totalVotes and user gets forbidden", async () => {
    // non-admin should be forbidden
    const res1 = await request(app).get("/vote/summary").set("Authorization", `Bearer ${userToken}`);
    expect(res1.statusCode).toBe(403);

    // admin should get total sum (Alice=2, Bob=1 => total 3)
    const res2 = await request(app).get("/vote/summary").set("Authorization", `Bearer ${adminToken}`);
    expect(res2.statusCode).toBe(200);
    expect(res2.body.totalVotes).toBe(3);
  });
});
