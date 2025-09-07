const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/User");

beforeAll(async () => {
  // connect to a test db
  await mongoose.connect("mongodb://127.0.0.1:27017/voting_app_test");
  await User.deleteMany({});
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

describe("Admin tests", () => {
  let userToken;
  let userId;
  let adminToken;

  it("logs in both user and admin", async () => {
    const user = await request(app).post("/auth/login").send({
      username: "user1",
      password: "123",
    });
    expect(user.statusCode).toBe(200);
    expect(user.body.token).toBeDefined();
    userToken = user.body.token;
    userId = user.body.id;

    const admin = await request(app).post("/auth/login").send({
      username: "admin1",
      password: "123",
    });
    expect(admin.statusCode).toBe(200);
    expect(admin.body.token).toBeDefined();
    adminToken = admin.body.token;
  });
  //get user
  it("admin should access /admin/users", async () => {
    const res = await request(app).get("/admin/users").set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("user should not access /admin/users", async () => {
    const res = await request(app).get("/admin/users").set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  // edit user role
  it("admin should be able to edit user role", async () => {
    const res = await request(app).put(`/admin/users/${userId}`).set("Authorization", `Bearer ${adminToken}`).send({ role: "admin" });
    expect(res.statusCode).toBe(200);

    const updated = await User.findById(userId);
    expect(updated.role).toBe("admin");
  });

  it("user should not be able to edit user role", async () => {
    const res = await request(app).put(`/admin/users/${userId}`).set("Authorization", `Bearer ${userToken}`).send({ role: "user" });
    expect(res.statusCode).toBe(403);

      const updated = await User.findById(userId);
    expect(updated.role).toBe("admin");
  });
  //delete user;
  it("admin should be able to delete user", async () => {
    const res = await request(app).delete(`/admin/users/${userId}`).set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);

    const deleted = await User.findById(userId);
    expect(deleted).toBe(null);
  });

  it("user should not be able to delete user", async () => {
    const res = await request(app).delete(`/admin/users/${userId}`).set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });
});
