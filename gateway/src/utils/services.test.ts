import { test } from "node:test";
import assert from "node:assert/strict";
import { services } from "./services.js";

const servicesList = ["auth"];

test("every route target is a well-formed http URL", () => {
  for (const [path, target] of Object.entries(services)) {
    assert.doesNotThrow(
      () => new URL(target),
      `${path} -> ${target} is not a valid URL`,
    );
  }
});

test("correct number of fields are available", () => {
  assert.equal(Object.keys(services).length, 1)
});

for (const input of servicesList) {
  test(`services should contain ${input}`, () => {
    assert.equal(Object.keys(services).some(
        (data) => {return data.includes(input)}
    ), true);
  });
}

test("no two routes point at the same backing service on the same port", () => {
  const targets = Object.values(services);
  assert.equal(
    new Set(targets).size,
    targets.length,
    "duplicate proxy targets found",
  );
});
