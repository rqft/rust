import { println, Vec } from ".";

export namespace tests {
  export function usize_eq() {
    const v = Vec.new().push(1);
    println(v.alloc);
  }
}

const errors = [];
console.log("running %s tests", Object.keys(tests).length);
for (const fn in tests) {
  const v = tests[fn as never] as unknown;
  if (typeof v == "function") {
    try {
      v();
      console.log("test tests::%s ... \u001b[32mok\u001b[0m", fn);
    } catch (e) {
      console.log("test tests::%s ... \u001b[31mfailed\u001b[0m", fn);
      errors.push(`[tests::${fn} failed]:\n${e}`);
    }
  } else {
    console.log("test tests::%s ... failed (not a test)");
  }
}

if (errors.length) {
  console.log(errors.join("\n"));
}
