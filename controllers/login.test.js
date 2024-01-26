const login = require("./login");

const { User } = require("../models/user");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fakeToken"),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(() => true),
}));

jest.mock("../models/user", () => ({
  User: {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock("../helpers", () => ({
  HttpError: jest.fn(),
  ctrlWrapper: jest.fn(),
}));

describe("Login Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("handles login successfully with status code 200", async () => {
    const mockUser = {
      _id: "fakeUserId",
      email: "fake@example.com",
      password: "fakePassword",
    };

    User.findOne.mockResolvedValueOnce(mockUser);

    const req = {
      body: { email: "fake@example.com", password: "fakePassword" },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("handles login successfully and returns token", async () => {
    const mockUser = {
      _id: "fakeUserId",
      email: "fake@example.com",
      subscription: "fakeSubscription",
    };

    User.findOne.mockResolvedValueOnce(mockUser);

    const req = {
      body: { email: "fake@example.com", password: "fakePassword" },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      token: "fakeToken",
      user: {
        email: "fake@example.com",
        subscription: "fakeSubscription",
      },
    });
  });

  test("handles login successfully and returns user object with email and subscription", async () => {
    const mockUser = {
      _id: "fakeUserId",
      email: "fake@example.com",
      subscription: "fakeSubscription",
    };

    User.findOne.mockResolvedValueOnce(mockUser);

    const req = {
      body: { email: "fake@example.com", password: "fakePassword" },
    };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith({
      token: "fakeToken",
      user: {
        email: expect.any(String),
        subscription: expect.any(String),
      },
    });
  });
});
