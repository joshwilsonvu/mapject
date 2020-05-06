import Mapject from "../src";
import util from "util";

describe("Mapject instances", () => {
  test("assignment and access", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    mj.ghjk = 5678;
    expect(mj.asdf).toBe(1234);
    expect(mj.ghjk).toBe(5678);
    expect(mj.zxcv).toBe(undefined);
  });
  test("defineProperty", () => {
    const mj = Mapject();
    Object.defineProperty(mj, "asdf", { value: 1234, writable: false });
    expect(mj.asdf).toBe(1234);
    expect(() => mj.asdf = 5678).not.toThrow(); // property descriptors other than `value` ignored
  });
  test("in and Object.hasOwnProperty", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    expect("asdf" in mj).toBe(true);
    expect("ghjk" in mj).toBe(false);
    // mj doesn't use Object.prototype but can use Object methods
    expect("hasOwnProperty" in mj).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(mj, "asdf")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(mj, "ghjk")).toBe(false);
  });
  test("delete", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    mj.ghjk = 5678;
    delete mj.asdf;
    expect("asdf" in mj).toBe(false);
    expect(mj.asdf).toBe(undefined);
  });
  test("keys", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    mj.ghjk = 5678;
    expect(Object.keys(mj)).toEqual(["asdf", "ghjk"]);
  });
  test("getPropertyDescriptor", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    expect(Object.getOwnPropertyDescriptor(mj, "asdf")).toEqual({
      value: 1234,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });
  test("getPrototypeOf and setPrototypeOf", () => {
    const mj = Mapject();
    expect(Object.getPrototypeOf(mj)).toEqual(Object.create(null));
    expect(() => Object.setPrototypeOf(mj, { asdf: 1234 })).toThrowError(TypeError);
  });
  test("iterable and spreadable", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    mj.ghjk = 5678;
    expect([...mj]).toEqual([["asdf", 1234], ["ghjk", 5678]]); // remembers insertion order
    expect({...mj}).toEqual({ asdf: 1234, ghjk: 5678 });
  });
  test("instanceof and logging", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    mj.ghjk = 5678;
    expect(typeof mj).toBe("object");
    expect(mj instanceof Object).toBe(false); // no "prototype" or "constructor" field
    expect(mj instanceof Map).toBe(false);
    // uses Map[Symbol.toString] for formatting
    expect(util.format(mj)).toEqual(util.format(Mapject.getMap(mj)));
  });
  test("special properties ignored", () => {
    const mj = Mapject();
    expect(mj).not.toHaveProperty("constructor");
    expect(mj).not.toHaveProperty("prototype");
    expect(mj).not.toHaveProperty("__proto__");
    (mj.constructor as any) = "asdf";
    (mj.prototype as any) = "ghjk";
    (mj.__proto__ as any) = "zxcv";
    expect([...mj]).toEqual([
      ["constructor", "asdf"],
      ["prototype", "ghjk"],
      ["__proto__", "zxcv"],
    ]);
  })
});

describe("Mapject function", () => {
  test("uses a given Map", () => {
    const map = new Map<string, number>();
    map.set("asdf", 1234);
    const mj = Mapject(map);
    expect(mj.asdf).toBe(1234); // mj uses the values in the passed map
    mj.ghjk = 5678;
    expect(map.has("ghjk")).toBe(true); // changes to mj are reflected in map
  });
  test("uses a copy of a given object", () => {
    const baseObj = {
      asdf: 1234,
    };
    const mj = Mapject(baseObj);
    expect(mj.asdf).toBe(1234);
    mj.ghjk = 5678;
    expect(baseObj).not.toHaveProperty("ghjk")
  })
});

describe("Mapject static methods", () => {
  describe("Mapject.getMap", () => {
    // Creating a Mapject with an underlying Map
    const map1 = new Map<string, number>();
    const obj1 = Mapject(map1);
    expect(Mapject.getMap(obj1)).toBe(map1);

    // Getting the underlying Map from a Mapject
    const obj2 = Mapject<number>();
    obj2.asdf = 1234;
    const map2 = Mapject.getMap(obj2);
    expect(map2).toBeTruthy();
    expect(Array.from(map2!.entries())).toEqual([["asdf", 1234]]);

    // Get nothing from an object that's not a Mapject
    expect(Mapject.getMap({})).toBe(undefined);
  });
  test("Mapject.size", () => {
    const mj = Mapject();
    mj.asdf = 1234;
    mj.ghjk = 5678;
    expect(Mapject.size(mj)).toBe(2);
    const map = Mapject.getMap(mj);
    expect(map && map.size).toBe(2);

    // No reported size for an object that's not a Mapject
    expect(Mapject.size({})).toBe(undefined);
  });
});
