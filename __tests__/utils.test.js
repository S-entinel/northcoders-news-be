const {
  convertTimestampToDate
} = require("../db/seeds/utils");

describe("convertTimestampToDate", () => {
  test("returns a new object", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result).not.toBe(input);
    expect(result).toBeObject();
  });
  test("converts a created_at property to a date", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    const result = convertTimestampToDate(input);
    expect(result.created_at).toBeDate();
    expect(result.created_at).toEqual(new Date(timestamp));
  });
  test("does not mutate the input", () => {
    const timestamp = 1557572706232;
    const input = { created_at: timestamp };
    convertTimestampToDate(input);
    const control = { created_at: timestamp };
    expect(input).toEqual(control);
  });
  test("ignores includes any other key-value-pairs in returned object", () => {
    const input = { created_at: 0, key1: true, key2: 1 };
    const result = convertTimestampToDate(input);
    expect(result.key1).toBe(true);
    expect(result.key2).toBe(1);
  });
  test("returns unchanged object if no created_at property", () => {
    const input = { key: "value" };
    const result = convertTimestampToDate(input);
    const expected = { key: "value" };
    expect(result).toEqual(expected);
  });
});

describe("refactorData", () => {
  test("returns unchanged input for empty input", () => {
    const input = [];
    const result = refactorData(input);
    expect(result).toEqual([]);
  });

  test("does not change the input", () => {
    const input = [
      {name: "Turbo", age: 2, animal: "Snail"},
      {friend: "Winchester", age: 3, animal: "Dog"},
      {friend: "Uni", age: 5, animal: "Cat"},
    ]
    const control = [...input]
    expect(input).toEqual(control)

  });

  test("returns a new object", () => {
    const input = [
      {name: "Turbo", age: 2, animal: "Snail"},
      {friend: "Winchester", age: 3, animal: "Dog"},
      {friend: "Uni", age: 5, animal: "Cat"},
    ]
    const result = refactorData(input);
    expect(input).not.toBe(result);
  });


  test("turns array of objects into array of arrays", () => {
    const input = [
      {name: "Turbo", age: 2, animal: "Snail"},
      {friend: "Winchester", age: 3, animal: "Dog"},
      {friend: "Uni", age: 5, animal: "Cat"},
    ]
    const result = refactorData(input);
    console.log(result)
    const answer = [
      ["Turbo", 2, "Snail"],
      ["Winchester", 3, "Dog"],
      ["Uni", 5, "Cat"],
    ]
    expect(result).toEqual(answer);
  });
});

