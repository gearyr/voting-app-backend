const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

beforeAll(async () => {
  // connect to a test db
  await mongoose.connect("mongodb://127.0.0.1:27017/voting_app_test");
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Auth Api", () => {
  let adminToken;
  let userToken;

  it("should register an admin", async () => {
    const res = await request(app).post("/auth/register").send({ username: "admin1", password: "123", role: "admin" });

    expect(res.statusCode).toBe(200);
  });

  it("should register a user", async () => {
    const res = await request(app).post("/auth/register").send({ username: "user1", password: "123", role: "user" });

    expect(res.statusCode).toBe(200);
  });

  it("should login as admin", async () => {
    const res = await request(app).post("/auth/login").send({
      username: "admin1",
      password: "123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    adminToken = res.body.token;
  });

  it("should login as user", async () => {
    const res = await request(app).post("/auth/login").send({
      username: "user1",
      password: "123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    userToken = res.body.token;
  });
});

describe("JWT Middleware", () => {
  it("should reject request with no token", async () => {
    const res = await request(app).get("/protected");
    expect(res.statusCode).toBe(401);
  });

  it("should reject request with invalid token", async () => {
    const res = await request(app).get("/protected").set("Authorization", "Bearer faketoken");
    expect(res.statusCode).toBe(403);
  });

  it("should allow request with valid token", async () => {
    const loginRes = await request(app).post("/auth/login").send({ username: "user1", password: "123" });
    
    const res = await request(app).get("/protected").set("Authorization", `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toBe(200);
  });
});
