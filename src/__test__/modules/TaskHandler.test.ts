import { remapObj } from "../../core/modules/TaskHandler";

describe("remapObj", () => {
  it("should return a new object with the same keys and values", () => {
    const input = {
      a: 1,
      b: 2,
      c: 3,
    };

    const result = remapObj(input);

    expect(result).toEqual(input);
    expect(result).not.toBe(input); // Ensure it's a new object
  });

  it("should correctly handle an empty object", () => {
    const input = {};

    const result = remapObj(input);

    expect(result).toEqual(input);
  });

  it("should correctly handle an object with string keys", () => {
    const input = { key1: "value1", key2: "value2" };

    const result = remapObj(input);

    expect(result).toEqual(input);
    expect(result).not.toBe(input); // Ensure it's a new object
  });

  it("should maintain the type structure of the input object", () => {
    interface MyObject {
      name: string;
      age: number;
    }

    const input: MyObject = {
      name: "John",
      age: 30,
    };

    const result = remapObj(input);

    expect(result).toEqual(input);
    expect(result).not.toBe(input); // Ensure it's a new object
  });

  it("should work with complex objects", () => {
    const input = {
      user: {
        id: "123",
        name: "Jane Doe",
      },
      active: true,
    };

    const result = remapObj(input);

    expect(result).toEqual(input);
    expect(result).not.toBe(input); // Ensure it's a new object
  });
});
