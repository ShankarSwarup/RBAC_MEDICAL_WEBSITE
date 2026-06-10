from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    HRFlowable, XPreformatted, KeepTogether
)
from xml.sax.saxutils import escape
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import textwrap

OUTPUT = "outputs/Accion_Labs_Full_Interview_Answers.pdf"

doc = SimpleDocTemplate(
    OUTPUT, pagesize=A4,
    leftMargin=1.8*cm, rightMargin=1.8*cm,
    topMargin=2*cm, bottomMargin=2*cm
)

# ── Styles ──────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def S(name, parent='Normal', **kw):
    return ParagraphStyle(name, parent=base[parent], **kw)

cover_title  = S('CoverTitle', 'Title', fontSize=28, textColor=colors.HexColor('#1a237e'),
                 spaceAfter=12, alignment=TA_CENTER)
cover_sub    = S('CoverSub',  fontSize=14, textColor=colors.HexColor('#3949ab'),
                 spaceAfter=6, alignment=TA_CENTER)
cover_note   = S('CoverNote', fontSize=10, textColor=colors.grey,
                 spaceAfter=4, alignment=TA_CENTER)

section_h    = S('SectionH', 'Heading1', fontSize=18, textColor=colors.HexColor('#0d47a1'),
                 spaceBefore=18, spaceAfter=8, borderPad=4)
topic_h      = S('TopicH',   'Heading2', fontSize=13, textColor=colors.HexColor('#1565c0'),
                 spaceBefore=14, spaceAfter=4)
q_style      = S('QStyle',   fontSize=11, textColor=colors.HexColor('#b71c1c'),
                 spaceBefore=10, spaceAfter=3, fontName='Helvetica-Bold')
body         = S('Body',     fontSize=9.5, leading=14, spaceAfter=4)
code_style   = S('Code',     fontName='Courier', fontSize=7.5, leading=10,
                 backColor=colors.HexColor('#f5f5f5'), borderColor=colors.HexColor('#bdbdbd'),
                 borderWidth=0.5, borderPad=6, spaceAfter=6, spaceBefore=4)
label_style  = S('Label',    fontSize=8.5, textColor=colors.HexColor('#37474f'),
                 fontName='Helvetica-BoldOblique', spaceAfter=2)

def add_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.grey)
    page_num = f"Page {doc.page}"
    canvas.drawRightString(A4[0] - 1.8*cm, 1*cm, f"{page_num}  |  Accion Labs — MERN/MEAN Interview Answer Guide")
    canvas.restoreState()

def hr():
    return HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#90caf9'), spaceAfter=4)

def section(title):
    return [PageBreak(), Paragraph(title, section_h), hr()]

def topic(title):
    return [Paragraph(title, topic_h)]

def Q(num, text):
    return Paragraph(f"Q{num}. {text}", q_style)

def body_p(text):
    return Paragraph(text, body)

def code(txt):
    # clean leading spaces per line for readability
    lines = textwrap.dedent(txt).strip().split('\n')
    safe_txt = escape('\n'.join(lines))
    return XPreformatted(safe_txt, code_style)

def label(txt):
    return Paragraph(txt, label_style)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
story = []

# ── COVER ──────────────────────────────────────────────────────────────────
story += [
    Spacer(1, 3*cm),
    Paragraph("MERN / MEAN Stack", cover_title),
    Paragraph("Complete Interview Answer Guide", cover_sub),
    Spacer(1, 0.4*cm),
    HRFlowable(width='60%', thickness=2, color=colors.HexColor('#1a237e')),
    Spacer(1, 0.4*cm),
    Paragraph("Accion Labs — All Rounds Covered", cover_note),
    Paragraph("JavaScript · React · Angular · Node.js · MongoDB · Express · System Design", cover_note),
    Spacer(1, 1*cm),
    Paragraph("130 Detailed Answers with Real-World JavaScript Code Examples", cover_note),
    Paragraph("Rounds 2 · 3 · 4 · 5 · Bonus Topics", cover_note),
    Spacer(1, 2*cm),
    Paragraph("2026 Edition", cover_note),
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUND 2 — JAVASCRIPT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
story += section("ROUND 2 — JavaScript Core Concepts  (Q34–Q50)")

# Q34
story += [
    Q(34, "What are closures and give a real-world use case?"),
    body_p("A closure is a function that remembers the variables from its outer (lexical) scope even after that outer function has returned. In JavaScript, every function forms a closure over the environment in which it was created. This is not a bug or an edge-case — it is a fundamental language feature that enables data privacy, factory functions, memoization, and event handlers."),
    body_p("How it works: When a function is created, the JS engine does not copy the outer variables. Instead it keeps a live reference to the outer scope's variable environment. Even after the outer function finishes, the inner function still holds that reference alive."),
    label("Real-world Example 1 — Counter with private state:"),
    code("""
function createCounter() {
  let count = 0;            // private — cannot be touched from outside

  return {
    increment() { count++; },
    decrement() { count--; },
    value()     { return count; }
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.value()); // 2
console.log(count);           // ReferenceError — count is private
"""),
    label("Real-world Example 2 — Event handler factory (button IDs):"),
    code("""
function makeHandler(buttonId) {
  return function() {
    console.log(`Button ${buttonId} clicked`);  // closes over buttonId
  };
}

document.getElementById('btn1').addEventListener('click', makeHandler('btn1'));
document.getElementById('btn2').addEventListener('click', makeHandler('btn2'));
"""),
    label("Real-world Example 3 — Memoization:"),
    code("""
function memoize(fn) {
  const cache = {};                 // closed over by the returned function
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache[key] !== undefined) return cache[key];
    cache[key] = fn(...args);
    return cache[key];
  };
}

const expensiveSquare = memoize(n => {
  console.log('computing...');
  return n * n;
});

expensiveSquare(5); // computing... 25
expensiveSquare(5); // 25  (served from cache — no log)
"""),
    body_p("Why it matters: Closures are the backbone of React's useState hook, Redux store, Node.js middleware chains, and virtually every library you use daily."),
]

# Q35
story += [
    Q(35, "Explain hoisting — how does it work for var, let, const, and functions?"),
    body_p("Hoisting is JavaScript's behaviour of moving declarations to the top of their scope during the compilation phase, before any code executes. Only the declaration is hoisted — not the initialisation."),
    body_p("var: Declaration is hoisted to the top of the function scope and automatically initialised to undefined. You can read it before its line but get undefined."),
    body_p("let / const: Declarations ARE hoisted to the top of their block scope, but they are NOT initialised. Accessing them before their line throws a ReferenceError — this window is called the Temporal Dead Zone (TDZ)."),
    body_p("Function declarations: Fully hoisted — both the declaration AND the body. You can call a function declaration before it appears in the source code."),
    body_p("Function expressions / arrow functions: Only the variable declaration is hoisted (as var/let/const). The function body is NOT hoisted."),
    code("""
// --- var ---
console.log(a);   // undefined  (hoisted, not initialised)
var a = 10;
console.log(a);   // 10

// --- let / const (TDZ) ---
// console.log(b); // ReferenceError: Cannot access 'b' before init
let b = 20;

// --- Function Declaration (fully hoisted) ---
greet();          // "Hello!"   — works before the declaration
function greet() { console.log("Hello!"); }

// --- Function Expression (NOT hoisted) ---
// sayHi();       // TypeError: sayHi is not a function
var sayHi = function() { console.log("Hi!"); };

// --- Real-world pitfall with var in a loop ---
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // prints 3, 3, 3 (NOT 0,1,2)
}

// Fix: use let instead
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);  // prints 0, 1, 2
}
"""),
]

# Q36
story += [
    Q(36, "What is the event loop? How does it handle async operations?"),
    body_p("JavaScript is single-threaded — it has one call stack. Yet it handles async operations (network calls, timers, I/O) without blocking. This magic is achieved through the event loop, which coordinates the call stack with several queues."),
    body_p("Components: Call Stack (LIFO — where executing code lives), Web APIs / Node APIs (where async work actually happens — browser or libuv), Microtask Queue (Promises, queueMicrotask, MutationObserver — highest priority), Macrotask Queue / Task Queue (setTimeout, setInterval, I/O callbacks — lower priority)."),
    body_p("Event loop cycle: 1) Execute everything currently on the call stack. 2) Drain the entire microtask queue (run ALL pending microtasks). 3) Take ONE macrotask from the task queue and execute it. 4) Drain microtasks again. 5) Repeat."),
    code("""
console.log('1 - synchronous');

setTimeout(() => console.log('2 - macrotask (setTimeout)'), 0);

Promise.resolve().then(() => console.log('3 - microtask (Promise)'));

queueMicrotask(() => console.log('4 - microtask (queueMicrotask)'));

console.log('5 - synchronous');

// Output order:
// 1 - synchronous
// 5 - synchronous
// 3 - microtask (Promise)
// 4 - microtask (queueMicrotask)
// 2 - macrotask (setTimeout)
"""),
    label("Real-world impact — why this matters in Node.js API servers:"),
    code("""
// Blocking the event loop starves ALL other requests:
app.get('/bad', (req, res) => {
  // Heavy sync computation — blocks the loop for ALL users
  const result = heavySyncComputation();  // BAD
  res.json(result);
});

// Correct: offload to async or worker threads
app.get('/good', async (req, res) => {
  const result = await computeInWorker();  // non-blocking
  res.json(result);
});
"""),
]

# Q37
story += [
    Q(37, "Difference between == and ==="),
    body_p("=== (strict equality) checks both value AND type — no conversion is performed. == (loose equality) performs type coercion before comparing: it converts one or both operands to a common type using complex rules defined in the ECMAScript spec."),
    body_p("In practice: always use === unless you have a specific reason for type coercion. The rules for == are notoriously counterintuitive and a common source of bugs."),
    code("""
// === never coerces
console.log(1 === '1');   // false  (number vs string)
console.log(0 === false); // false  (number vs boolean)
console.log(null === undefined); // false

// == coerces in surprising ways
console.log(1 == '1');    // true  ('1' coerced to 1)
console.log(0 == false);  // true  (false coerced to 0)
console.log(null == undefined); // true  (special rule)
console.log(null == 0);   // false (null only == undefined)
console.log('' == false); // true  (both coerced to 0)
console.log([] == false); // true  ([] -> '' -> 0, false -> 0)

// Real-world tip: API data from JSON is always strings
const userId = '42';      // came from query param or JSON
userId === 42;            // false — catches the bug
userId == 42;             // true  — silently hides it
"""),
]

# Q38
story += [
    Q(38, "What are Promises? How do they differ from callbacks?"),
    body_p("A Promise is an object representing the eventual completion or failure of an asynchronous operation. It has three states: pending (initial), fulfilled (resolved with a value), or rejected (failed with a reason). Promises were introduced to solve callback hell — deeply nested callbacks that are hard to read, reason about, and handle errors in."),
    body_p("Key differences from callbacks: 1) Promises are composable — you can chain .then()/.catch(). 2) Error propagation is automatic — a rejection travels down the chain until caught. 3) Promises are eager — they start executing immediately on creation. 4) Promises guarantee single invocation — a callback can be called multiple times."),
    code("""
// ── Callback style (callback hell) ──────────────────────────
fetchUser(userId, function(err, user) {
  if (err) return handleError(err);
  fetchOrders(user.id, function(err, orders) {
    if (err) return handleError(err);
    fetchInvoice(orders[0].id, function(err, invoice) {
      if (err) return handleError(err);
      console.log(invoice);       // deeply nested — hard to maintain
    });
  });
});

// ── Promise style ────────────────────────────────────────────
fetchUser(userId)
  .then(user   => fetchOrders(user.id))
  .then(orders => fetchInvoice(orders[0].id))
  .then(invoice => console.log(invoice))
  .catch(err   => handleError(err));   // ONE error handler for the whole chain

// ── Creating a Promise ───────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Promise.all — run in parallel, wait for all ──────────────
async function loadDashboard(userId) {
  const [user, orders, notifications] = await Promise.all([
    fetchUser(userId),
    fetchOrders(userId),
    fetchNotifications(userId)
  ]);
  return { user, orders, notifications };
}

// ── Promise.allSettled — don't fail if one rejects ───────────
const results = await Promise.allSettled([p1, p2, p3]);
results.forEach(r => {
  if (r.status === 'fulfilled') use(r.value);
  else console.error(r.reason);
});
"""),
]

# Q39
story += [
    Q(39, "Explain async/await — how does it work under the hood?"),
    body_p("async/await is syntactic sugar over Promises. An async function always returns a Promise. The await keyword pauses execution of the async function until the awaited Promise settles — without blocking the thread. Under the hood, the JS engine transforms async/await into a state machine similar to what you'd write with Promise chains."),
    body_p("await can only be used inside an async function (or at the top level of an ES module). It suspends only the current async function — the event loop and other code continue running normally."),
    code("""
// ── Basic async/await ────────────────────────────────────────
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);  // pauses here
  const user     = await response.json();             // pauses here
  return user;                                        // wraps in Promise.resolve(user)
}

// ── Error handling ───────────────────────────────────────────
async function safeGetUser(id) {
  try {
    const user = await getUser(id);
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error.message);
    return null;
  }
}

// ── Sequential vs Parallel ───────────────────────────────────
// SLOW — sequential (each waits for the previous)
async function slow() {
  const user   = await fetchUser(1);     // 300ms
  const orders = await fetchOrders(1);   // 200ms  (starts after user)
  return { user, orders };               // total: ~500ms
}

// FAST — parallel with Promise.all
async function fast() {
  const [user, orders] = await Promise.all([
    fetchUser(1),     // 300ms
    fetchOrders(1)    // 200ms  (starts at same time)
  ]);
  return { user, orders };               // total: ~300ms
}

// ── Top-level await (ES modules) ─────────────────────────────
// In a .mjs file or type="module":
const config = await loadConfig();   // works at top level
"""),
]

# Q40
story += [
    Q(40, "What is the difference between call, apply, and bind?"),
    body_p("All three methods allow you to explicitly set what 'this' refers to inside a function. The difference is in how they are invoked and how arguments are passed."),
    body_p("call: Invokes the function immediately. Arguments passed individually after the context."),
    body_p("apply: Invokes the function immediately. Arguments passed as an array (useful when args are already in an array)."),
    body_p("bind: Does NOT invoke the function. Returns a NEW function with 'this' permanently bound. Used for event handlers and partial application."),
    code("""
const person = { name: 'Alice' };

function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

// call — invoke immediately, args as list
greet.call(person, 'Hello', '!');      // "Hello, Alice!"

// apply — invoke immediately, args as array
greet.apply(person, ['Hi', '?']);      // "Hi, Alice?"

// bind — returns new function, invoke later
const greetAlice = greet.bind(person, 'Hey');
greetAlice('.');   // "Hey, Alice."

// ── Real-world: bind in event handlers ──────────────────────
class Timer {
  constructor() {
    this.seconds = 0;
    // Without bind, 'this' inside tick() would be the global object
    setInterval(this.tick.bind(this), 1000);
  }
  tick() { this.seconds++; }
}

// ── Real-world: Math.max with apply ─────────────────────────
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
Math.max.apply(null, numbers);  // 9
// Modern equivalent: Math.max(...numbers)
"""),
]

# Q41
story += [
    Q(41, "Explain prototypal inheritance in JavaScript"),
    body_p("In JavaScript, every object has an internal link to another object called its prototype. When you access a property or method that doesn't exist on an object, the engine walks up the prototype chain until it finds it or reaches null. This is prototype-based inheritance — different from class-based inheritance in Java/C++."),
    body_p("Every function has a .prototype property. When you use 'new', a new object is created with its [[Prototype]] set to the constructor's .prototype. ES6 class syntax is just syntactic sugar over this same mechanism."),
    code("""
// ── Prototype chain directly ─────────────────────────────────
const animal = {
  breathe() { return `${this.name} is breathing`; }
};

const dog = Object.create(animal);   // dog's prototype = animal
dog.name  = 'Rex';
dog.bark  = function() { return 'Woof!'; };

dog.bark();     // 'Woof!'  — own property
dog.breathe();  // 'Rex is breathing'  — found on prototype

// ── Constructor functions ────────────────────────────────────
function Animal(name) { this.name = name; }
Animal.prototype.breathe = function() {
  return `${this.name} is breathing`;
};

function Dog(name, breed) {
  Animal.call(this, name);  // call parent constructor
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() { return 'Woof!'; };

// ── ES6 class syntax (same thing under the hood) ─────────────
class Animal2 {
  constructor(name) { this.name = name; }
  breathe() { return `${this.name} is breathing`; }
}

class Dog2 extends Animal2 {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  bark() { return 'Woof!'; }
}

const rex = new Dog2('Rex', 'Labrador');
rex.bark();        // 'Woof!'
rex.breathe();     // 'Rex is breathing' (inherited)
rex instanceof Dog2;    // true
rex instanceof Animal2; // true
"""),
]

# Q42
story += [
    Q(42, "What are arrow functions and how do they differ from regular functions?"),
    body_p("Arrow functions (=>) are a concise syntax for writing functions, but they are NOT just shorthand. They have fundamentally different behaviour in four ways:"),
    body_p("1. Lexical 'this': Arrow functions capture 'this' from their surrounding scope at the time they are created. They do not have their own 'this'. Regular functions get 'this' dynamically based on how they are called."),
    body_p("2. No 'arguments' object: Arrow functions do not have their own arguments object. Use rest parameters instead."),
    body_p("3. Cannot be used as constructors: You cannot call 'new' on an arrow function."),
    body_p("4. No prototype property: Arrow functions have no .prototype."),
    code("""
// ── Lexical this — the most important difference ─────────────
class Timer {
  constructor() { this.count = 0; }

  startWrong() {
    setInterval(function() {
      this.count++;          // 'this' is undefined (strict) or global
    }, 1000);
  }

  startRight() {
    setInterval(() => {
      this.count++;          // 'this' is the Timer instance — correct!
    }, 1000);
  }
}

// ── No arguments object ──────────────────────────────────────
function regular() {
  console.log(arguments);  // works — Arguments object
}

const arrow = (...args) => {
  console.log(args);       // use rest params instead
};

// ── Concise body (implicit return) ───────────────────────────
const double  = x => x * 2;
const add     = (a, b) => a + b;
const getUser = id => ({ id, name: 'Alice' });  // wrap object in ()

// ── When to use regular functions ────────────────────────────
const obj = {
  value: 42,
  // Regular function needed — 'this' should refer to obj
  getValue: function() { return this.value; },
  // Arrow would capture outer 'this' (probably global/undefined)
};
"""),
]

# Q43
story += [
    Q(43, "What is the Temporal Dead Zone (TDZ)?"),
    body_p("The Temporal Dead Zone is the period between the start of a block scope and the point where a let or const declaration is initialised. During the TDZ, the variable exists (is hoisted) but is not accessible. Any attempt to read or write it throws a ReferenceError."),
    body_p("This is actually a safety feature. With var you silently get undefined before initialisation, which hides bugs. With let/const you get an immediate, explicit error."),
    code("""
{
  // TDZ for 'x' starts here
  console.log(typeof x); // ReferenceError (not 'undefined' like var!)
  let x = 5;             // TDZ ends here — x is now accessible
  console.log(x);        // 5
}

// ── typeof is NOT safe with let/const ────────────────────────
console.log(typeof undeclaredVar); // 'undefined' — no error for truly undeclared
// console.log(typeof myLet);     // ReferenceError if myLet is in TDZ

// ── TDZ with default parameters ──────────────────────────────
function greet(name, greeting = `Hello ${name}`) {
  // 'name' is accessible as a parameter before 'greeting'
  return greeting;
}

// ── Class bodies also have TDZ ────────────────────────────────
class Foo {
  bar = this.baz;   // baz is in TDZ here if declared after
  baz = 42;
}
"""),
]

# Q44
story += [
    Q(44, "What is the 'this' keyword? How does its value change in different contexts?"),
    body_p("'this' refers to the execution context — the object that is currently running the code. Its value is determined at runtime based on HOW a function is called, not where it is defined (except for arrow functions which use lexical scope)."),
    code("""
// 1. Global context
console.log(this); // window (browser) or {} (Node.js module)

// 2. Regular function call (strict mode — undefined; sloppy — global)
function show() { console.log(this); }
show(); // undefined (strict) or window (sloppy)

// 3. Method call — 'this' = the object before the dot
const user = {
  name: 'Alice',
  getName() { return this.name; }
};
user.getName(); // 'Alice'

// 4. Losing context
const fn = user.getName;
fn(); // undefined — 'this' is no longer 'user'

// 5. new — 'this' = newly created object
function Person(name) { this.name = name; }
const p = new Person('Bob');   // this.name = 'Bob'

// 6. call / apply / bind — explicit 'this'
user.getName.call({ name: 'Charlie' }); // 'Charlie'

// 7. Arrow function — lexical 'this' from enclosing scope
const obj = {
  value: 100,
  getArrow: function() {
    const inner = () => this.value; // captures 'this' from getArrow
    return inner();
  }
};
obj.getArrow(); // 100

// 8. Event handler — 'this' = the DOM element
button.addEventListener('click', function() {
  console.log(this); // the button element
});
// With arrow: 'this' is the enclosing scope (e.g., class instance)
"""),
]

# Q45
story += [
    Q(45, "Difference between null and undefined"),
    body_p("undefined means a variable has been declared but has not been assigned a value yet. It is JavaScript's own way of saying 'no value'. null is an explicit assignment — a developer intentionally sets a variable to null to say 'this has no value' or 'this intentionally empty'."),
    code("""
let a;
console.log(a);           // undefined — declared but not assigned

let b = null;
console.log(b);           // null — intentionally empty

// typeof
console.log(typeof undefined); // 'undefined'
console.log(typeof null);      // 'object' — historical JS bug

// Equality
console.log(null == undefined);  // true  (loose — special rule)
console.log(null === undefined); // false (strict — different types)

// Real-world: API responses
const user = fetchUser(id);
if (user === null) {
  // User was looked up but doesn't exist in the DB
}
if (user === undefined) {
  // The property was never set — maybe a code bug
}

// Optional chaining with null/undefined
const city = user?.address?.city ?? 'Unknown';
// ?? (nullish coalescing) returns right side only for null/undefined
// (unlike || which also triggers for 0, '', false)
"""),
]

# Q46
story += [
    Q(46, "What is event bubbling and event capturing?"),
    body_p("When an event occurs on a DOM element, it goes through three phases: Capture phase (event travels from the root down to the target), Target phase (event reaches the target element), Bubble phase (event travels back up from target to the root). By default, addEventListener listens in the bubble phase. To listen in the capture phase, pass {capture: true} as the third argument."),
    code("""
// HTML structure: document > div#outer > div#inner > button
const outer  = document.getElementById('outer');
const inner  = document.getElementById('inner');
const button = document.getElementById('btn');

// Bubbling (default) — inner fires first, then outer
inner.addEventListener('click', () => console.log('inner bubble'));
outer.addEventListener('click', () => console.log('outer bubble'));
// Click button: "inner bubble", then "outer bubble"

// Capturing — outer fires first
outer.addEventListener('click', () => console.log('outer capture'), true);
inner.addEventListener('click', () => console.log('inner capture'), true);
// Click button: "outer capture", "inner capture", "inner bubble", "outer bubble"

// stopPropagation — prevent further bubbling/capturing
button.addEventListener('click', (e) => {
  e.stopPropagation();          // stops the event from bubbling up
  console.log('button clicked');
});

// ── Event Delegation (practical use of bubbling) ─────────────
// Instead of adding listeners to 100 list items, add ONE to the parent
const list = document.getElementById('todo-list');
list.addEventListener('click', (e) => {
  if (e.target.matches('li')) {
    console.log('Clicked:', e.target.textContent);
    e.target.classList.toggle('done');
  }
});
// Works even for items added dynamically AFTER the listener was attached
"""),
]

# Q47
story += [
    Q(47, "What are generators in JavaScript?"),
    body_p("A generator is a special function that can pause its execution and resume it later. Defined with function*, it uses the yield keyword to pause and optionally produce a value. When called, it returns a Generator object (an iterator). The generator does not execute immediately — it only runs when you call .next() on the iterator."),
    body_p("Generators are powerful for: lazy evaluation of infinite sequences, implementing iterators, async control flow (basis of async/await in older transpilers), and cancellable async operations."),
    code("""
// ── Basic generator ──────────────────────────────────────────
function* count() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = count();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// ── Infinite sequence ────────────────────────────────────────
function* idGenerator() {
  let id = 1;
  while (true) {        // infinite — safe because yield pauses it
    yield id++;
  }
}
const getId = idGenerator();
getId.next().value; // 1
getId.next().value; // 2
// Never runs out of IDs

// ── Passing values back in ───────────────────────────────────
function* adder() {
  let result = 0;
  while (true) {
    const input = yield result;   // yield pauses AND receives next .next(val)
    if (input === null) break;
    result += input;
  }
}
const a = adder();
a.next();       // start — { value: 0 }
a.next(5);      // { value: 5 }
a.next(10);     // { value: 15 }

// ── for...of with generators ─────────────────────────────────
function* range(start, end, step = 1) {
  for (let i = start; i <= end; i += step) yield i;
}
[...range(1, 10, 2)]; // [1, 3, 5, 7, 9]
"""),
]

# Q48
story += [
    Q(48, "Explain the difference between shallow copy and deep copy"),
    body_p("A shallow copy creates a new object but only copies the top-level properties. Nested objects and arrays still share references with the original. A deep copy recursively copies all nested objects/arrays so the copy is completely independent of the original."),
    code("""
// ── Shallow copy methods ─────────────────────────────────────
const original = { a: 1, nested: { b: 2 }, arr: [1, 2] };

const s1 = Object.assign({}, original);
const s2 = { ...original };     // spread operator

s2.a = 99;              // does NOT affect original
s2.nested.b = 99;       // DOES affect original — shared reference!
console.log(original.nested.b); // 99

// ── Deep copy options ────────────────────────────────────────

// Option 1: JSON (simple but has limitations)
const d1 = JSON.parse(JSON.stringify(original));
// Loses: undefined, functions, Date objects, Infinity, circular refs

// Option 2: structuredClone (modern — Node 17+, modern browsers)
const d2 = structuredClone(original);   // handles Date, Map, Set, etc.
d2.nested.b = 999;
console.log(original.nested.b); // 2 — unchanged

// Option 3: Lodash (for older environments)
import _ from 'lodash';
const d3 = _.cloneDeep(original);

// ── Custom recursive deep clone ───────────────────────────────
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
}

// ── Real-world: Redux state updates (always shallow or deep copy) ──
const newState = { ...state, user: { ...state.user, name: 'Bob' } };
"""),
]

# Q49
story += [
    Q(49, "What is a WeakMap and when would you use it?"),
    body_p("A WeakMap is a collection of key-value pairs where keys must be objects (not primitives), and the keys are held weakly — meaning they do not prevent garbage collection. If the key object is no longer referenced elsewhere, it can be garbage collected and its WeakMap entry is automatically removed. WeakMaps are not iterable, have no size property, and have no way to list all entries."),
    body_p("Use WeakMap when you want to associate metadata with objects without leaking memory — especially when you do not control the object's lifetime."),
    code("""
// ── Problem WeakMap solves ────────────────────────────────────
const cache = new Map();   // regular Map holds strong ref to DOM nodes
function process(node) {
  if (cache.has(node)) return cache.get(node);
  const result = heavyComputation(node);
  cache.set(node, result);
  return result;
}
// If node is removed from DOM, Map still holds it — MEMORY LEAK

// ── With WeakMap — no memory leak ────────────────────────────
const weakCache = new WeakMap();
function processWeak(node) {
  if (weakCache.has(node)) return weakCache.get(node);
  const result = heavyComputation(node);
  weakCache.set(node, result);    // auto-cleaned when node is GC'd
  return result;
}

// ── Private class data pattern ───────────────────────────────
const _private = new WeakMap();

class BankAccount {
  constructor(balance) {
    _private.set(this, { balance });   // stored outside instance
  }
  deposit(amount) {
    const data = _private.get(this);
    data.balance += amount;
  }
  getBalance() {
    return _private.get(this).balance; // truly private
  }
}

const acc = new BankAccount(1000);
acc.getBalance(); // 1000
// acc._private    — undefined — no access

// Note: Modern JS supports private class fields with # prefix
class BankAccount2 {
  #balance;
  constructor(b) { this.#balance = b; }
  getBalance() { return this.#balance; }
}
"""),
]

# Q50
story += [
    Q(50, "What are Symbol types in JavaScript?"),
    body_p("Symbol is a primitive data type introduced in ES6 that creates guaranteed unique values. Every Symbol() call returns a completely unique value, even with the same description. Symbols are often used as unique property keys that will never clash with string keys or keys from other libraries."),
    code("""
// ── Uniqueness ───────────────────────────────────────────────
const s1 = Symbol('id');
const s2 = Symbol('id');
s1 === s2;  // false — always unique

// ── As object keys (won't clash) ─────────────────────────────
const ID = Symbol('id');
const user = {
  name: 'Alice',
  [ID]: 42          // Symbol as computed key
};
user.id;     // undefined — string 'id' key
user[ID];    // 42      — Symbol key

// ── Symbols are not enumerable by default ───────────────────
Object.keys(user);    // ['name']  — ID not included
JSON.stringify(user); // '{"name":"Alice"}' — Symbol ignored

// ── Well-known Symbols (hooks into JS internals) ─────────────
class Range {
  constructor(start, end) { this.start = start; this.end = end; }

  [Symbol.iterator]() {         // makes Range iterable!
    let current = this.start;
    const end = this.end;
    return {
      next() {
        return current <= end
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
}

const range = new Range(1, 5);
[...range];                 // [1, 2, 3, 4, 5]
for (const n of range) { } // works!

// ── Symbol.for — global shared symbols ───────────────────────
const s3 = Symbol.for('app.token');   // registered globally
const s4 = Symbol.for('app.token');   // returns the same one
s3 === s4;  // true
"""),
]

# ── REACT.JS ──────────────────────────────────────────────────────────────
story += section("ROUND 2 — React.js Core Concepts  (Q51–Q70)")

# Q51
story += [
    Q(51, "What is the Virtual DOM and how does React use it?"),
    body_p("The Virtual DOM (VDOM) is a lightweight, in-memory JavaScript representation of the real DOM tree. Instead of manipulating the real DOM directly on every state change (which is slow because DOM operations trigger layout, paint, and composite in the browser), React keeps a virtual copy, computes what changed, and then makes minimal, surgical updates to the real DOM."),
    body_p("Process: 1) On state/prop change, React re-renders the component into a new VDOM tree. 2) React diffs the new tree against the previous VDOM (reconciliation). 3) React computes the minimum set of changes (patch). 4) React applies those changes to the real DOM in a batch."),
    code("""
// React manages the VDOM automatically. Here is what happens conceptually:

// You write JSX:
function Counter({ count }) {
  return <div><span>{count}</span></div>;
}

// React compiles JSX to:
function Counter({ count }) {
  return React.createElement('div', null,
    React.createElement('span', null, count)
  );
}

// Each call produces a plain JS object (VDOM node):
// { type: 'div', props: { children: { type: 'span', props: { children: 5 } } } }

// When count changes from 5 to 6:
// Old VDOM: { type: 'span', props: { children: 5 } }
// New VDOM: { type: 'span', props: { children: 6 } }
// Diff:  only the text content changed
// Real DOM update: only ONE text node gets updated — not the entire tree

// ── Performance benefit in practice ─────────────────────────
// Without VDOM (naive approach):
todoList.innerHTML = todos.map(t => `<li>${t.text}</li>`).join('');
// Re-creates ALL list items, loses focus, resets scroll position

// With React VDOM:
// Only changed items are updated, unchanged items are untouched
"""),
]

# Q52
story += [
    Q(52, "Explain the React reconciliation algorithm (React Fiber)"),
    body_p("Reconciliation is the process React uses to determine what changed in the VDOM and what needs to be updated in the real DOM. React Fiber (introduced in React 16) is the complete rewrite of the reconciliation engine that makes it incremental and interruptible."),
    body_p("Key heuristics: 1) Different element types produce completely different trees — React destroys the old tree and builds new. 2) Keys help React match list items across renders — without keys React uses index which causes bugs. 3) React processes one Fiber node at a time and can pause to handle higher-priority work (user input)."),
    code("""
// ── Keys — why they matter ────────────────────────────────────
// BAD — using index as key (default if no key)
todos.map((todo, index) => <TodoItem key={index} todo={todo} />);
// If you prepend an item, React thinks ALL items changed

// GOOD — stable, unique key
todos.map(todo => <TodoItem key={todo.id} todo={todo} />);
// React efficiently maps old items to new items by ID

// ── Component type change — full unmount/remount ─────────────
// Changing type at same position destroys state:
isAdmin ? <AdminPanel /> : <UserPanel />
// When isAdmin flips, React destroys AdminPanel and creates UserPanel from scratch

// ── shouldComponentUpdate / React.memo ───────────────────────
// Tell React: "skip reconciliation if props haven't changed"
const MemoizedList = React.memo(function List({ items }) {
  return <ul>{items.map(i => <li key={i.id}>{i.text}</li>)}</ul>;
}, (prevProps, nextProps) => {
  // return true to skip re-render
  return prevProps.items === nextProps.items;
});

// ── Fiber priorities ─────────────────────────────────────────
// React 18 concurrent mode batches and prioritizes work:
import { startTransition } from 'react';

startTransition(() => {
  setSearchResults(filterLargeList(query)); // low priority — can be interrupted
});
// Meanwhile, typing in the input remains responsive (high priority)
"""),
]

# Q53
story += [
    Q(53, "What are React Hooks? List the most commonly used ones"),
    body_p("Hooks are functions that let functional components 'hook into' React state and lifecycle features without writing class components. Introduced in React 16.8. Rules of Hooks: only call at the top level (not inside loops/conditions), only call from React functions."),
    code("""
import { useState, useEffect, useReducer, useCallback,
         useMemo, useRef, useContext } from 'react';

// ── useState — local state ───────────────────────────────────
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ── useEffect — side effects (data fetching, subscriptions) ──
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchUser(userId).then(data => {
      if (!cancelled) setUser(data);
    });
    return () => { cancelled = true; };  // cleanup on unmount or userId change
  }, [userId]);  // dependency array — re-run when userId changes

  return user ? <div>{user.name}</div> : <Spinner />;
}

// ── useReducer — complex state logic ─────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD':    return [...state, action.item];
    case 'REMOVE': return state.filter(i => i.id !== action.id);
    default:       return state;
  }
}
function Cart() {
  const [items, dispatch] = useReducer(cartReducer, []);
  dispatch({ type: 'ADD', item: { id: 1, name: 'Book' } });
}

// ── Custom Hook — reusable stateful logic ─────────────────────
function useFetch(url) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return { data, loading, error };
}

// Usage:
function App() {
  const { data, loading } = useFetch('/api/users');
  if (loading) return <Spinner />;
  return <UserList users={data} />;
}
"""),
]

# Q54
story += [
    Q(54, "Difference between useEffect and useLayoutEffect"),
    body_p("Both run after render, but at different times in the browser's pipeline. useEffect runs asynchronously AFTER the browser has painted the screen — it does not block the visual update. useLayoutEffect runs synchronously AFTER DOM mutations but BEFORE the browser paints — it blocks paint until it finishes."),
    body_p("Use useLayoutEffect when you need to measure DOM elements or make DOM mutations that should be invisible to the user (to avoid visual flickers). Use useEffect (the default) for everything else — data fetching, subscriptions, logging."),
    code("""
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// ── useEffect — doesn't block paint ──────────────────────────
useEffect(() => {
  fetchData().then(setData);   // async — fine in useEffect
}, []);

// ── useLayoutEffect — blocks paint ───────────────────────────
function Tooltip({ targetRef, text }) {
  const tooltipRef = useRef(null);
  const [pos, setPos]= useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // Measure DOM BEFORE browser paints (no flicker!)
    const targetRect  = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    setPos({
      top:  targetRect.top  - tooltipRect.height - 8,
      left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
    });
  });

  return (
    <div ref={tooltipRef} style={{ position: 'fixed', ...pos }}>
      {text}
    </div>
  );
}
// If useEffect was used here, tooltip would visibly flash at (0,0) first
"""),
]

# Q55
story += [
    Q(55, "What is useRef and when do you use it?"),
    body_p("useRef returns a mutable object { current: initialValue } that persists for the full lifetime of the component. Two main use cases: 1) Accessing DOM elements directly (like document.getElementById but the React way). 2) Storing any mutable value that should NOT trigger a re-render when changed (unlike useState)."),
    code("""
import { useRef, useEffect, useState } from 'react';

// ── Use case 1: DOM reference ─────────────────────────────────
function SearchBox() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();  // focus on mount
  }, []);

  return <input ref={inputRef} type="text" />;
}

// ── Use case 2: Mutable value without re-render ───────────────
function VideoPlayer({ isPlaying }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isPlaying) videoRef.current.play();
    else           videoRef.current.pause();
  }, [isPlaying]);

  return <video ref={videoRef} src="/movie.mp4" />;
}

// ── Use case 3: Store previous value ─────────────────────────
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;   // runs AFTER render — stores previous
  });
  return ref.current;      // returns value from BEFORE render
}

function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = usePrevious(count);
  return <p>Now: {count}, Before: {prevCount}</p>;
}

// ── Use case 4: Avoid stale closure in setInterval ────────────
function Timer() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  countRef.current = count;  // always fresh

  useEffect(() => {
    const id = setInterval(() => {
      console.log(countRef.current);  // fresh value — no stale closure
    }, 1000);
    return () => clearInterval(id);
  }, []);  // empty deps — interval created once
}
"""),
]

# Q56
story += [
    Q(56, "What is useMemo vs useCallback? When to use each?"),
    body_p("Both are performance optimisation hooks that memoize (cache) a value across renders. They only re-compute when their dependency array changes."),
    body_p("useMemo: Memoizes the RESULT of a computation. Use it to avoid expensive recalculations on every render."),
    body_p("useCallback: Memoizes a FUNCTION REFERENCE. Use it to prevent creating a new function on every render — important when passing callbacks to child components wrapped in React.memo (a new reference would break memoization)."),
    body_p("Do not over-use: memoisation has overhead. Only use when profiling shows a performance problem."),
    code("""
import { useMemo, useCallback, useState, memo } from 'react';

// ── useMemo — expensive computation ──────────────────────────
function ProductList({ products, filter }) {
  // Recalculate ONLY when products or filter changes
  const filtered = useMemo(() => {
    console.log('filtering...');
    return products.filter(p =>
      p.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [products, filter]);

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}

// ── useCallback — stable function reference ───────────────────
const Button = memo(function Button({ onClick, label }) {
  console.log('Button rendered');
  return <button onClick={onClick}>{label}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');

  // Without useCallback — new function on every render, Button re-renders
  // const handleClick = () => setCount(c => c + 1);

  // With useCallback — same function reference unless deps change
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);  // no deps — never recreated

  return (
    <div>
      <Button onClick={handleClick} label="Increment" />
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle theme (won't re-render Button above)
      </button>
    </div>
  );
}
"""),
]

# Q57
story += [
    Q(57, "What is Context API and when would you use it over Redux?"),
    body_p("Context API is React's built-in way to share data across the component tree without passing props at every level (avoiding prop drilling). Redux is an external state management library with a more structured approach: a single store, actions, reducers, and middleware for side effects."),
    body_p("Use Context API for: theme, locale, auth user, feature flags — data that is read frequently but changes infrequently. Use Redux (or Zustand/Jotai) for: complex state with many transitions, shared state that many components read/write, need for middleware/DevTools/time-travel debugging, or when Context would cause excessive re-renders."),
    code("""
// ── Context API — auth example ────────────────────────────────
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login  = async (creds) => {
    const u = await api.login(creds);
    setUser(u);
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

// Any component anywhere in the tree:
function Header() {
  const { user, logout } = useAuth();
  return <button onClick={logout}>Logout {user?.name}</button>;
}

// ── Redux Toolkit (RTK) — shopping cart example ───────────────
import { createSlice, configureStore } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addItem:    (state, action) => { state.push(action.payload); },
    removeItem: (state, action) => state.filter(i => i.id !== action.payload),
  }
});

export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
export const { addItem, removeItem } = cartSlice.actions;
"""),
]

# Q58
story += [
    Q(58, "What is the difference between controlled and uncontrolled components?"),
    body_p("A controlled component is one where React state drives the form element's value. Every keystroke updates state, and the input always shows what state says. An uncontrolled component stores its own value in the DOM — you access it using a ref. Controlled components give you full control (instant validation, conditional submit) at the cost of more boilerplate."),
    code("""
// ── Controlled component ─────────────────────────────────────
function ControlledForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // name and email always in sync with state
    api.submit({ name, email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button>Submit</button>
    </form>
  );
}

// ── Uncontrolled component ───────────────────────────────────
function UncontrolledForm() {
  const nameRef  = useRef();
  const emailRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Read value from DOM at submit time
    api.submit({ name: nameRef.current.value, email: emailRef.current.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef}  defaultValue="" />
      <input ref={emailRef} defaultValue="" />
      <button>Submit</button>
    </form>
  );
}
// Use uncontrolled for: file inputs (always uncontrolled), integrating
// with non-React libraries, simple forms where you only need value on submit
"""),
]

# Q59
story += [
    Q(59, "Explain React lifecycle methods (class components)"),
    body_p("React class components go through three phases: Mounting (component added to DOM), Updating (re-render from state/prop changes), and Unmounting (component removed). Hooks are the functional equivalent — useEffect covers most lifecycle needs."),
    code("""
class UserProfile extends React.Component {
  // ── MOUNTING ─────────────────────────────────────────────
  constructor(props) {
    super(props);
    this.state = { user: null, loading: true };
    // Initialize state, bind methods
  }

  static getDerivedStateFromProps(props, state) {
    // Sync state from props before every render (rarely needed)
    return null;
  }

  componentDidMount() {
    // Called after component is added to DOM
    // Perfect for: API calls, subscriptions, DOM manipulation
    fetchUser(this.props.userId)
      .then(user => this.setState({ user, loading: false }));
  }

  // ── UPDATING ─────────────────────────────────────────────
  shouldComponentUpdate(nextProps, nextState) {
    // Return false to skip re-render (optimisation)
    return nextProps.userId !== this.props.userId;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // Called right before DOM update — capture scroll position
    return this.listRef.scrollHeight;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // Called after re-render
    if (prevProps.userId !== this.props.userId) {
      fetchUser(this.props.userId)
        .then(user => this.setState({ user }));
    }
  }

  // ── UNMOUNTING ───────────────────────────────────────────
  componentWillUnmount() {
    // Clean up: cancel subscriptions, clear timers
    clearInterval(this.timerID);
    this.subscription.unsubscribe();
  }

  render() {
    const { user, loading } = this.state;
    return loading ? <Spinner /> : <div>{user.name}</div>;
  }
}

// ── Functional Hook equivalents ───────────────────────────────
function UserProfileFn({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {                        // componentDidMount + componentDidUpdate
    fetchUser(userId).then(setUser);
    return () => { /* componentWillUnmount cleanup */ };
  }, [userId]);                            // re-run when userId changes

  return user ? <div>{user.name}</div> : <Spinner />;
}
"""),
]

# Q60
story += [
    Q(60, "What are Pure Components and React.memo?"),
    body_p("React.PureComponent (class) and React.memo (functional) are optimisation tools that prevent unnecessary re-renders by doing a shallow comparison of props (and state for PureComponent). If nothing changed, they skip the render."),
    code("""
// ── React.memo — functional components ───────────────────────
const ExpensiveChart = React.memo(function Chart({ data, title }) {
  console.log('Chart rendered');
  return <div>/* expensive chart */<h2>{title}</h2></div>;
});
// Only re-renders if 'data' or 'title' reference changes

// Custom comparison (deep equal):
const SmartChart = React.memo(Chart, (prev, next) => {
  return JSON.stringify(prev.data) === JSON.stringify(next.data)
    && prev.title === next.title;
});

// ── PureComponent — class components ─────────────────────────
class PureList extends React.PureComponent {
  render() {
    return <ul>{this.props.items.map(i => <li key={i.id}>{i.text}</li>)}</ul>;
  }
}
// Automatically does shallow comparison — same as React.memo for classes

// ── Pitfall: mutation breaks memoization ─────────────────────
// BAD — mutating the array gives it the same reference
items.push(newItem);
setItems(items);       // React.memo sees same ref — NO re-render!

// GOOD — create new reference
setItems([...items, newItem]);  // new array reference — re-render
"""),
]

# Q61-62
story += [
    Q(61, "How do you implement code splitting in React?"),
    Q(62, "What is lazy loading in React?"),
    body_p("Code splitting means breaking the JavaScript bundle into smaller chunks that are loaded on demand rather than all at once. This reduces the initial bundle size and speeds up the first load. React.lazy and Suspense are the built-in tools for this."),
    code("""
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// ── Route-level code splitting ────────────────────────────────
const Home      = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings  = lazy(() => import('./pages/Settings'));
// Each page loads its JS only when navigated to

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// ── Component-level splitting (heavy modals, charts) ─────────
const HeavyModal = lazy(() => import('./HeavyModal'));

function App2() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button onClick={() => setShowModal(true)}>Open</button>
      {showModal && (
        <Suspense fallback={<Spinner />}>
          <HeavyModal onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
}

// ── Named exports with lazy ───────────────────────────────────
const { Chart } = lazy(() =>
  import('./components/Chart').then(m => ({ default: m.Chart }))
);

// ── Preload on hover (user intent) ────────────────────────────
const loadDashboard = () => import('./pages/Dashboard');
<Link onMouseEnter={loadDashboard} to="/dashboard">Dashboard</Link>
"""),
]

# Q63
story += [
    Q(63, "What is JSX and how does it get compiled?"),
    body_p("JSX (JavaScript XML) is a syntax extension for JavaScript that looks like HTML. It is NOT valid JavaScript — it must be compiled (by Babel or the TypeScript compiler) into regular JavaScript React.createElement() calls. JSX makes component trees more readable and less error-prone than manual React.createElement calls."),
    code("""
// ── JSX ──────────────────────────────────────────────────────
const element = (
  <div className="card" onClick={handleClick}>
    <h1>Hello, {user.name}!</h1>
    <p style={{ color: 'blue' }}>Welcome</p>
  </div>
);

// ── What Babel compiles it to (classic transform) ─────────────
const element2 = React.createElement(
  'div',
  { className: 'card', onClick: handleClick },
  React.createElement('h1', null, 'Hello, ', user.name, '!'),
  React.createElement('p', { style: { color: 'blue' } }, 'Welcome')
);

// ── New JSX transform (React 17+) — no import needed ─────────
// Babel now compiles to:
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
const element3 = _jsxs('div', {
  className: 'card',
  onClick: handleClick,
  children: [
    _jsx('h1', { children: ['Hello, ', user.name, '!'] }),
    _jsx('p', { style: { color: 'blue' }, children: 'Welcome' }),
  ]
});

// ── JSX rules ────────────────────────────────────────────────
// 1. className instead of class
// 2. htmlFor instead of for
// 3. camelCase event names: onClick, onChange, onSubmit
// 4. Self-closing tags: <img />, <input />, <br />
// 5. Must return single root (or use Fragment <>...</>)
// 6. JS expressions in {}, not statements
"""),
]

# Q64
story += [
    Q(64, "What are Higher Order Components (HOC)?"),
    body_p("A Higher Order Component is a function that takes a component and returns a new enhanced component. HOCs are a pattern for reusing component logic — similar to higher-order functions in functional programming. Common uses: adding authentication checks, logging, theming, data fetching. React Hooks have largely replaced HOCs for new code, but HOCs are still found in many codebases and libraries (React-Redux connect, React Router withRouter)."),
    code("""
// ── withAuth HOC — protect routes ────────────────────────────
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} user={user} />;
  };
}

// Usage:
const ProtectedDashboard = withAuth(Dashboard);

// ── withLoading HOC ───────────────────────────────────────────
function withLoading(WrappedComponent) {
  return function({ isLoading, ...props }) {
    if (isLoading) return <Spinner />;
    return <WrappedComponent {...props} />;
  };
}

// ── withLogger HOC — log renders ──────────────────────────────
function withLogger(WrappedComponent) {
  return function(props) {
    useEffect(() => {
      console.log(`${WrappedComponent.name} mounted`, props);
      return () => console.log(`${WrappedComponent.name} unmounted`);
    });
    return <WrappedComponent {...props} />;
  };
}

// ── Composing multiple HOCs ───────────────────────────────────
const EnhancedDashboard = withLogger(withAuth(withLoading(Dashboard)));

// Modern equivalent: Custom Hooks are cleaner
function useDashboardData(userId) {
  const { user }       = useAuth();
  const { data, loading } = useFetch(`/api/dashboard/${userId}`);
  return { user, data, loading };
}
"""),
]

# Q65
story += [
    Q(65, "What is prop drilling and how do you avoid it?"),
    body_p("Prop drilling occurs when you pass data through multiple intermediate components that don't actually need the data — they just pass it down to their children. This makes the code hard to maintain because changing the shape of the data requires updating every component in the chain. Solutions: Context API, state management (Redux/Zustand), component composition."),
    code("""
// ── Problem: prop drilling 3 levels deep ─────────────────────
function App() {
  const [user, setUser] = useState({ name: 'Alice', role: 'admin' });
  return <Layout user={user} />;    // Layout doesn't need user
}
function Layout({ user }) {
  return <Sidebar user={user} />;   // Sidebar doesn't need user
}
function Sidebar({ user }) {
  return <UserAvatar user={user} />; // Only this needs it
}

// ── Solution 1: Context API ───────────────────────────────────
const UserContext = createContext(null);

function App2() {
  const [user] = useState({ name: 'Alice', role: 'admin' });
  return (
    <UserContext.Provider value={user}>
      <Layout2 />          {/* no user prop needed */}
    </UserContext.Provider>
  );
}
function Layout2()  { return <Sidebar2 />; }   // no prop
function Sidebar2() { return <UserAvatar2 />; } // no prop
function UserAvatar2() {
  const user = useContext(UserContext);  // gets it directly
  return <img src={user.avatar} alt={user.name} />;
}

// ── Solution 2: Component composition (render props/children) ─
function App3() {
  const [user] = useState({ name: 'Alice' });
  return (
    <Layout>
      <Sidebar>
        <UserAvatar user={user} />  {/* passed as children */}
      </Sidebar>
    </Layout>
  );
}
// Layout and Sidebar just render {children} — no prop drilling
"""),
]

# Q66
story += [
    Q(66, "How does React Router work? BrowserRouter vs HashRouter?"),
    body_p("React Router is a declarative routing library for React. It maps URL paths to components. It uses the browser History API (or hash) to manage navigation without full-page reloads."),
    body_p("BrowserRouter: Uses HTML5 History API (pushState). URLs look clean: /dashboard. Requires server to serve index.html for all routes (otherwise direct navigation to /dashboard returns 404). BrowserRouter is preferred."),
    body_p("HashRouter: Uses URL hash: /#/dashboard. The server only sees / — everything after # is client-side. Works without server configuration. Useful for static file hosts or when you can't configure server routing."),
    code("""
import { BrowserRouter, Routes, Route, Link,
         Navigate, useParams, useNavigate, Outlet } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/users">Users</Link>
      </nav>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/users"     element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />

        {/* Protected route */}
        <Route path="/admin" element={
          <RequireAuth><AdminPanel /></RequireAuth>
        } />

        {/* Nested routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index            element={<DashboardHome />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings"  element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function UserDetail() {
  const { id } = useParams();             // read :id from URL
  const navigate = useNavigate();
  return (
    <div>
      <h1>User {id}</h1>
      <button onClick={() => navigate(-1)}>Back</button>
    </div>
  );
}

function DashboardLayout() {
  return <div><Sidebar /><Outlet /></div>; // Outlet renders child route
}
"""),
]

# Q67
story += [
    Q(67, "What is Server-Side Rendering (SSR) in React? How does Next.js implement it?"),
    body_p("SSR means rendering the React component tree to HTML on the server for each request, sending that HTML to the browser. The browser shows content immediately (better FCP/LCP metrics), and then React hydrates (attaches event handlers) on the client. Benefits: better SEO (search bots see full HTML), faster perceived load, better performance on low-end devices."),
    code("""
// ── Next.js SSR with getServerSideProps ───────────────────────
// app/users/page.tsx (App Router — Server Component by default)
async function UsersPage() {
  // Runs on the server for every request
  const users = await fetch('https://api.example.com/users', {
    cache: 'no-store'        // SSR — fresh data every request
  }).then(r => r.json());

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
}
export default UsersPage;

// ── Next.js SSG — Static Site Generation (build time) ─────────
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(p => ({ slug: p.slug }));
}
async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}

// ── Next.js ISR — Incremental Static Regeneration ─────────────
async function ProductPage({ params }) {
  const product = await fetch(`/api/products/${params.id}`, {
    next: { revalidate: 60 }   // re-generate after 60 seconds
  }).then(r => r.json());
  return <Product data={product} />;
}

// ── Client Component (opt-in for interactivity) ───────────────
'use client';
function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(l => !l)}>{liked ? 'Liked' : 'Like'}</button>;
}
"""),
]

# Q68
story += [
    Q(68, "Explain the Flux architecture and how Redux implements it"),
    body_p("Flux is an application architecture pattern (not a library) introduced by Facebook to manage complex state flows. It enforces unidirectional data flow: Actions -> Dispatcher -> Store -> View. Redux is the most popular implementation of Flux, simplifying the dispatcher into pure reducer functions."),
    body_p("Redux principles: Single source of truth (one store), state is read-only (only actions can change it), changes are made with pure reducer functions (predictable, testable)."),
    code("""
// ── Redux Toolkit (modern Redux) ──────────────────────────────
import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';

// Async thunk for API calls
const fetchUsers = createAsyncThunk('users/fetchAll', async () => {
  const res = await fetch('/api/users');
  return res.json();
});

// Slice = reducer + actions
const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    addUser:    (state, action) => { state.list.push(action.payload); },
    removeUser: (state, action) => {
      state.list = state.list.filter(u => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending,   (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload;
      })
      .addCase(fetchUsers.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.error.message;
      });
  }
});

export const store = configureStore({
  reducer: { users: usersSlice.reducer }
});

// ── In components (with react-redux) ─────────────────────────
import { useSelector, useDispatch } from 'react-redux';

function UserList() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(state => state.users);

  useEffect(() => { dispatch(fetchUsers()); }, []);

  if (loading) return <Spinner />;
  return <ul>{list.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
"""),
]

# Q69
story += [
    Q(69, "What is Redux Thunk vs Redux Saga?"),
    body_p("Both are Redux middleware for handling side effects (async operations like API calls). Redux Thunk is simple: it lets you dispatch functions (thunks) instead of plain objects — the thunk can do async work and dispatch multiple actions. Redux Saga uses ES6 generators to describe complex async flows in a more testable, declarative way."),
    body_p("Use Thunk for: simple async operations, small-medium apps. Use Saga for: complex orchestration (parallel calls, cancellation, debouncing, retry logic, race conditions), when you need highly testable side effects."),
    code("""
// ── Redux Thunk ───────────────────────────────────────────────
// A thunk is just a function that returns a function:
const loginUser = (credentials) => async (dispatch, getState) => {
  dispatch({ type: 'auth/loginStart' });
  try {
    const user = await api.login(credentials);
    dispatch({ type: 'auth/loginSuccess', payload: user });
    dispatch(fetchUserProfile(user.id));  // dispatch another action
  } catch (error) {
    dispatch({ type: 'auth/loginFailure', payload: error.message });
  }
};
// Usage: dispatch(loginUser({ email, password }))

// ── Redux Saga ────────────────────────────────────────────────
import { call, put, takeLatest, all, race, delay, cancel } from 'redux-saga/effects';

// A saga is a generator function
function* loginSaga(action) {
  try {
    const user = yield call(api.login, action.payload);  // call API
    yield put({ type: 'auth/loginSuccess', payload: user });
    yield call(fetchProfileSaga, user.id);
  } catch (error) {
    yield put({ type: 'auth/loginFailure', payload: error.message });
  }
}

// Advanced: race condition — timeout vs API response
function* fetchWithTimeout(action) {
  const { data, timeout } = yield race({
    data:    call(api.fetchData, action.id),
    timeout: delay(5000)
  });
  if (timeout) yield put({ type: 'fetch/timeout' });
  else         yield put({ type: 'fetch/success', payload: data });
}

// Watch for actions
function* rootSaga() {
  yield all([
    takeLatest('auth/loginRequest', loginSaga),
    takeLatest('data/fetchRequest', fetchWithTimeout),
  ]);
}
"""),
]

# Q70
story += [
    Q(70, "How do you handle forms in React? (controlled, Formik, React Hook Form)"),
    body_p("There are three main approaches: controlled components (pure React state), Formik (form library with validation), and React Hook Form (performance-focused, uncontrolled internally with a clean API). React Hook Form is currently the most popular choice due to its minimal re-renders and simple API."),
    code("""
// ── 1. Controlled (pure React) ────────────────────────────────
function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email.includes('@')) e.email = 'Invalid email';
    if (form.password.length < 6)  e.password = 'Min 6 chars';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    api.login(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={form.email}
             onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      {errors.email && <span>{errors.email}</span>}
      <button>Login</button>
    </form>
  );
}

// ── 2. React Hook Form (recommended) ─────────────────────────
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars'),
});

function LoginFormRHF() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = (data) => api.login(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      <button>Login</button>
    </form>
  );
}
// Advantages: minimal re-renders, built-in validation, easy schema integration
"""),
]

# ── ANGULAR ──────────────────────────────────────────────────────────────
story += section("ROUND 2 — Angular Core Concepts  (Q71–Q80)")

story += [
    Q(71, "What is two-way data binding in Angular? How does ngModel work?"),
    body_p("Two-way data binding means the view (template) and the component's model (TypeScript class) stay in sync automatically. When the user changes input in the view, the model updates. When the model changes, the view updates. Angular achieves this with the [(ngModel)] directive — the square brackets bind a property to the element value (model -> view), and the parentheses listen for change events (view -> model). This is sometimes called banana-in-a-box syntax."),
    code("""
// app.module.ts — import FormsModule
import { FormsModule } from '@angular/forms';
@NgModule({ imports: [FormsModule] })

// Component:
@Component({
  selector: 'app-login',
  template: `
    <input [(ngModel)]="username" placeholder="Username" />
    <p>Hello, {{ username }}!</p>

    <!-- Equivalent long form: -->
    <input [value]="username" (input)="username = $event.target.value" />
  `
})
export class LoginComponent {
  username = '';  // model stays in sync with input
}

// ── Reactive Forms (preferred for complex forms) ──────────────
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      <div *ngIf="loginForm.get('email')?.invalid">Invalid email</div>
      <button type="submit" [disabled]="loginForm.invalid">Login</button>
    </form>
  `
})
export class ReactiveLoginComponent {
  loginForm = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value);
    }
  }
}
"""),
]

story += [
    Q(72, "Explain Angular's dependency injection system"),
    body_p("Dependency Injection (DI) is a design pattern where a class receives its dependencies from an external injector rather than creating them itself. Angular has a hierarchical DI system with multiple injectors (root, module, component). When you request a service in a component's constructor, Angular's injector looks up the dependency tree to find and provide the instance."),
    code("""
// ── Service definition ────────────────────────────────────────
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'   // singleton — one instance for the whole app
})
export class UserService {
  private users: User[] = [];

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  constructor(private http: HttpClient) {}
}

// ── Injecting into a component ────────────────────────────────
@Component({ selector: 'app-user-list', template: '...' })
export class UserListComponent implements OnInit {
  users: User[] = [];

  // Angular injects UserService automatically
  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUsers().subscribe(u => this.users = u);
  }
}

// ── Component-scoped service (each component gets its own instance) ──
@Component({
  providers: [CartService]   // new instance for this component subtree
})
export class CartComponent { constructor(private cart: CartService) {} }

// ── Injection tokens for non-class values ─────────────────────
export const API_URL = new InjectionToken<string>('API_URL');

@NgModule({
  providers: [{ provide: API_URL, useValue: 'https://api.example.com' }]
})

@Injectable()
export class ApiService {
  constructor(@Inject(API_URL) private apiUrl: string) {}
}
"""),
]

story += [
    Q(73, "What are Angular directives? Structural vs attribute directives?"),
    body_p("Directives are instructions in the template that tell Angular to transform the DOM. There are three types: Components (directives with a template), Structural directives (change the DOM structure — add/remove elements, prefix *), Attribute directives (change the appearance or behaviour of existing elements)."),
    code("""
// ── Built-in structural directives ───────────────────────────
// *ngIf — conditionally render
<div *ngIf="isLoggedIn; else loginTmpl">Welcome!</div>
<ng-template #loginTmpl><a routerLink="/login">Login</a></ng-template>

// *ngFor — repeat element
<li *ngFor="let user of users; let i = index; trackBy: trackById">
  {{ i + 1 }}. {{ user.name }}
</li>

// *ngSwitch
<div [ngSwitch]="status">
  <span *ngSwitchCase="'active'">Active</span>
  <span *ngSwitchDefault>Inactive</span>
</div>

// ── Built-in attribute directives ────────────────────────────
<p [ngClass]="{ 'active': isActive, 'disabled': isDisabled }">Text</p>
<div [ngStyle]="{ 'color': textColor, 'font-size': fontSize + 'px' }"></div>

// ── Custom structural directive: *appRepeat n times ───────────
@Directive({ selector: '[appRepeat]' })
export class RepeatDirective {
  @Input() set appRepeat(count: number) {
    this.vcRef.clear();
    for (let i = 0; i < count; i++) {
      this.vcRef.createEmbeddedView(this.tmplRef, { $implicit: i });
    }
  }
  constructor(private vcRef: ViewContainerRef,
              private tmplRef: TemplateRef<any>) {}
}
// Usage: <p *appRepeat="3; let i">Item {{ i }}</p>

// ── Custom attribute directive: highlight on hover ────────────
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input() appHighlight = 'yellow';
  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.background = this.appHighlight;
  }
  @HostListener('mouseleave') onLeave() {
    this.el.nativeElement.style.background = '';
  }
  constructor(private el: ElementRef) {}
}
"""),
]

story += [
    Q(74, "What is an Angular module (NgModule)?"),
    body_p("An NgModule is a class decorated with @NgModule that groups related components, directives, pipes, and services. Every Angular app has at least one root module (AppModule). Modules define what is available in their templates via declarations, what external Angular modules they need via imports, what services they register via providers, and what they export for other modules to use."),
    code("""
// ── Feature module example: UserModule ────────────────────────
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UserListComponent }   from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserService }         from './user.service';

@NgModule({
  declarations: [UserListComponent, UserDetailComponent],   // components/directives/pipes
  imports:      [CommonModule, RouterModule.forChild([
    { path: 'users',     component: UserListComponent },
    { path: 'users/:id', component: UserDetailComponent },
  ])],
  providers:    [UserService],     // module-scoped service
  exports:      [UserListComponent] // available to importing modules
})
export class UserModule {}

// ── Root AppModule imports UserModule ─────────────────────────
@NgModule({
  declarations: [AppComponent],
  imports:      [BrowserModule, HttpClientModule, UserModule, RouterModule.forRoot([])],
  bootstrap:    [AppComponent]
})
export class AppModule {}

// ── Standalone components (Angular 14+, preferred modern approach) ──
@Component({
  standalone: true,
  imports:    [CommonModule, RouterModule],
  template:   '<p *ngIf="user">{{ user.name }}</p>'
})
export class UserCardComponent { @Input() user: User; }
"""),
]

story += [
    Q(75, "What are Angular pipes? How do you create a custom pipe?"),
    body_p("Pipes are template functions that transform displayed values. They use the | syntax in templates. Angular provides built-in pipes: date, currency, decimal, percent, json, uppercase, lowercase, async (for Observables/Promises). Custom pipes let you create reusable transformations."),
    code("""
// ── Built-in pipes ────────────────────────────────────────────
{{ user.createdAt | date:'mediumDate' }}        // Jan 15, 2026
{{ product.price  | currency:'USD':'symbol' }}  // $99.99
{{ text           | slice:0:100 }}              // first 100 chars
{{ data           | json }}                     // pretty print
{{ observable$    | async }}                    // subscribe + unsubscribe auto

// ── Custom pipe: truncate text ────────────────────────────────
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', pure: true })  // pure=true (default): only runs when input changes
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 100, trail: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}
// Usage: {{ description | truncate:80:'...' }}

// ── Custom pipe: timeAgo ──────────────────────────────────────
@Pipe({ name: 'timeAgo', pure: false })  // impure: re-evaluates on every CD cycle
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
    if (seconds < 60)   return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
// Usage: {{ post.createdAt | timeAgo }}   // "5m ago"

// Register in module declarations or use standalone: true in the @Pipe decorator
"""),
]

story += [
    Q(76, "Explain Subject, BehaviorSubject, and ReplaySubject in RxJS"),
    body_p("These are special RxJS Observables that are also Observers — you can both subscribe to them AND push values into them with .next(). They are used extensively in Angular for sharing state between components."),
    body_p("Subject: No initial value. New subscribers only get future emissions. BehaviorSubject: Requires an initial value. New subscribers immediately get the LAST emitted value. Perfect for current state (auth user, theme). ReplaySubject: Replays the last N emissions to new subscribers. Useful for event logs."),
    code("""
import { Subject, BehaviorSubject, ReplaySubject } from 'rxjs';

// ── Subject ───────────────────────────────────────────────────
const subject = new Subject<string>();
subject.subscribe(v => console.log('A:', v));
subject.next('hello');         // A: hello
// New subscriber after the fact:
subject.subscribe(v => console.log('B:', v));
subject.next('world');         // A: world, B: world  (B missed 'hello')

// ── BehaviorSubject — for current state ───────────────────────
const user$ = new BehaviorSubject<User | null>(null);  // initial: null
user$.subscribe(u => console.log('user:', u));         // immediately: null

authService.login(creds).subscribe(user => user$.next(user));
// After login:
user$.subscribe(u => console.log(u?.name));  // immediately gets current user

// ── Angular service using BehaviorSubject ─────────────────────
@Injectable({ providedIn: 'root' })
export class CartService {
  private items$ = new BehaviorSubject<CartItem[]>([]);

  // Public read-only Observable
  readonly cart$ = this.items$.asObservable();

  addItem(item: CartItem) {
    this.items$.next([...this.items$.value, item]);
  }
  removeItem(id: string) {
    this.items$.next(this.items$.value.filter(i => i.id !== id));
  }
}

// In component template:
// <span>{{ cartService.cart$ | async | json }}</span>

// ── ReplaySubject ─────────────────────────────────────────────
const replay$ = new ReplaySubject<string>(3);  // replay last 3
replay$.next('a'); replay$.next('b'); replay$.next('c'); replay$.next('d');
replay$.subscribe(v => console.log(v)); // immediately: b, c, d (last 3)
"""),
]

story += [
    Q(77, "What is Change Detection in Angular? What is OnPush?"),
    body_p("Change Detection is Angular's process of checking if the model has changed and if the view needs to be updated. By default, Angular checks every component in the tree after every async event (click, HTTP response, setTimeout). With OnPush strategy, a component only re-checks when its input references change, an event originates from the component, an Observable it subscribes to with async pipe emits, or you manually trigger it."),
    code("""
// ── Default strategy — checks on every event ─────────────────
@Component({ selector: 'app-list', template: '...' })
export class ListComponent { @Input() items: Item[]; }
// Re-renders whenever anything in the app changes

// ── OnPush strategy — maximum performance ─────────────────────
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-list',
  template: `
    <li *ngFor="let item of items">{{ item.name }}</li>
    <p>{{ currentTime }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush  // <---
})
export class ListComponent {
  @Input() items: Item[];      // re-checks when items reference changes
  currentTime = new Date();

  constructor(private cdr: ChangeDetectorRef) {}

  // To manually trigger check:
  refresh() {
    this.currentTime = new Date();
    this.cdr.markForCheck();   // schedule a check on this component
    // or:
    this.cdr.detectChanges();  // synchronous check right now
  }
}

// ── Best practice: Observables + async pipe (OnPush friendly) ──
@Component({
  template: `
    <li *ngFor="let user of users$ | async">{{ user.name }}</li>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent {
  users$ = this.userService.getUsers(); // Observable — async pipe handles sub/unsub
  constructor(private userService: UserService) {}
}
"""),
]

story += [
    Q(78, "Explain Angular's router — RouterModule and lazy loading"),
    body_p("Angular Router maps URL paths to components and manages navigation without full page reloads. It supports nested routes, route guards, route parameters, and lazy loading of feature modules (loading module JS bundles only when needed, reducing initial bundle size)."),
    code("""
// app-routing.module.ts
const routes: Routes = [
  { path: '',       component: HomeComponent },
  { path: 'login',  component: LoginComponent },

  // Lazy loaded feature module:
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module')
                         .then(m => m.DashboardModule),
    canActivate: [AuthGuard]      // protect the route
  },

  // Lazy loaded standalone component (Angular 14+):
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component')
                          .then(m => m.ProfileComponent)
  },

  // Route with params
  { path: 'users/:id', component: UserDetailComponent },

  // Redirect and wildcard
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];

// ── In component: navigate programmatically ───────────────────
@Component({})
export class LoginComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  login() {
    // Navigate to dashboard after login
    this.router.navigate(['/dashboard']);
    // Or with query params:
    this.router.navigate(['/search'], { queryParams: { q: 'Angular' } });
  }

  ngOnInit() {
    // Read route params
    this.route.params.subscribe(params => {
      const id = params['id'];
    });
    // Read query params
    this.route.queryParams.subscribe(params => {
      const page = params['page'];
    });
  }
}
"""),
]

story += [
    Q(79, "What is the difference between Promise and Observable?"),
    body_p("Promise: handles a single async value, eagerly executes (starts immediately on creation), not cancellable, part of JavaScript standard. Observable: handles zero or more values over time (stream), lazy (doesn't execute until subscribed), cancellable (unsubscribe), composable with powerful operators (map, filter, debounce, switchMap). Angular is heavily Observable-based via RxJS."),
    code("""
// ── Promise (single value, eager) ────────────────────────────
const promise = fetch('/api/user');  // starts immediately
promise.then(r => r.json()).then(user => console.log(user));
// Cannot cancel — request is already in flight

// ── Observable (stream, lazy) ─────────────────────────────────
import { Observable, from, interval, fromEvent } from 'rxjs';
import { map, filter, debounceTime, switchMap, takeUntil } from 'rxjs/operators';

// Created but NOT executing yet:
const obs$ = new Observable<User>(subscriber => {
  fetch('/api/user')
    .then(r => r.json())
    .then(user => {
      subscriber.next(user);   // emit value
      subscriber.complete();   // done
    })
    .catch(err => subscriber.error(err));
});

// Starts executing only on subscribe:
const sub = obs$.subscribe({
  next:     user  => console.log(user),
  error:    err   => console.error(err),
  complete: ()    => console.log('done')
});

sub.unsubscribe();  // CANCEL — can abort the request

// ── Real-world: search input with debounce ────────────────────
const searchInput = document.getElementById('search');

fromEvent(searchInput, 'input').pipe(
  map(e => e.target.value),
  filter(v => v.length > 2),            // ignore short queries
  debounceTime(300),                    // wait for user to stop typing
  switchMap(query => this.http.get(`/api/search?q=${query}`)) // cancel prev request
).subscribe(results => this.results = results);
"""),
]

story += [
    Q(80, "What are Angular Guards? (CanActivate, CanDeactivate)"),
    body_p("Route guards are interfaces that let you control navigation. They run before Angular activates or deactivates a route. CanActivate: decides if a route can be entered (auth checks). CanDeactivate: decides if you can leave a route (unsaved changes warning). CanLoad: decides if a lazy module can be loaded."),
    code("""
// ── CanActivate guard (functional style, Angular 15+) ─────────
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }
  // Redirect to login with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// ── CanDeactivate guard — unsaved changes ─────────────────────
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> =
  (component) => {
    if (!component.canDeactivate()) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  };

// ── In routing config ─────────────────────────────────────────
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile/edit',
    component: EditProfileComponent,
    canDeactivate: [unsavedChangesGuard]
  }
];

// ── EditProfileComponent implements the interface ─────────────
export class EditProfileComponent implements CanComponentDeactivate {
  isDirty = false;
  canDeactivate() { return !this.isDirty; }
}
"""),
]

# ── NODE.JS ──────────────────────────────────────────────────────────────
story += section("ROUND 2 — Node.js  (Q81–Q90)")

story += [
    Q(81, "What is the Node.js event loop?"),
    body_p("Node.js uses a single-threaded, non-blocking I/O model powered by libuv. The event loop has distinct phases executed in a fixed order: timers (setTimeout/setInterval callbacks), pending callbacks (I/O callbacks deferred to next iteration), idle/prepare (internal), poll (retrieve new I/O events — blocks here if nothing else pending), check (setImmediate callbacks), close callbacks. Between each phase, Node drains both the nextTick queue and the microtask (Promise) queue."),
    code("""
// ── Phase execution order ─────────────────────────────────────
console.log('1 start');

setTimeout(() => console.log('2 setTimeout'), 0);       // timers phase
setImmediate(() => console.log('3 setImmediate'));       // check phase
process.nextTick(() => console.log('4 nextTick'));       // nextTick queue
Promise.resolve().then(() => console.log('5 Promise')); // microtask queue

console.log('6 end');

// Output:
// 1 start
// 6 end
// 4 nextTick      <- nextTick drains first (before microtasks)
// 5 Promise       <- microtask queue
// 2 setTimeout    <- timers phase
// 3 setImmediate  <- check phase

// ── Practical implication: never block the event loop ─────────
// BAD — synchronous file read blocks ALL requests
const data = fs.readFileSync('large-file.txt');

// GOOD — async — event loop continues while OS reads the file
fs.readFile('large-file.txt', (err, data) => {
  // process data here
});

// For CPU-heavy work: use worker threads
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-computation.js', { workerData: input });
worker.on('message', result => handleResult(result));
"""),
]

story += [
    Q(82, "What is the difference between process.nextTick() and setImmediate()?"),
    body_p("Both schedule callbacks to run asynchronously, but at different points. process.nextTick() executes before the event loop continues to its next phase — callbacks are queued in the nextTick queue which is drained after every operation, even before Promise microtasks. setImmediate() executes in the check phase of the event loop — after I/O events. Always prefer setImmediate over nextTick for I/O-related callbacks to avoid starving the event loop."),
    code("""
// ── Execution order ───────────────────────────────────────────
setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('Promise'));

// Output:
// nextTick   <- first (before anything)
// Promise    <- microtask queue
// setImmediate <- check phase

// ── Danger: recursive nextTick can starve I/O ─────────────────
// BAD:
function recursive() {
  process.nextTick(recursive);  // NEVER gives I/O a chance to run!
}

// GOOD: use setImmediate for recursive async operations
function recursiveGood() {
  setImmediate(recursiveGood);  // yields control between iterations
}

// ── Real use of nextTick: emit events after constructor ────────
class EventEmitter2 {
  constructor() {
    // Event handler likely attached after constructor
    // So emit on next tick to give caller time to attach handler
    process.nextTick(() => {
      this.emit('ready');
    });
  }
}
const ee = new EventEmitter2();
ee.on('ready', () => console.log('Ready!'));  // attached in time
"""),
]

story += [
    Q(83, "What are streams in Node.js?"),
    body_p("Streams are objects that let you read or write data piece by piece (in chunks) instead of loading everything into memory at once. This is crucial for handling large files, HTTP requests/responses, or any large data sets. Types: Readable (file reading, HTTP response), Writable (file writing, HTTP request), Duplex (both read/write), Transform (duplex that transforms data, e.g., zlib.createGzip())."),
    code("""
const fs   = require('fs');
const zlib = require('zlib');
const { pipeline, Transform } = require('stream');

// ── Reading a large file with streams (memory efficient) ──────
const readable = fs.createReadStream('large-file.csv', { highWaterMark: 64 * 1024 });
let lineCount = 0;
readable.on('data', chunk => {
  lineCount += chunk.toString().split('\n').length;
});
readable.on('end', () => console.log(`Lines: ${lineCount}`));

// ── Piping: read -> compress -> write ────────────────────────
const gzip = zlib.createGzip();
const source = fs.createReadStream('input.txt');
const dest   = fs.createWriteStream('input.txt.gz');

// pipeline handles backpressure + error cleanup automatically
pipeline(source, gzip, dest, (err) => {
  if (err) console.error('Pipeline failed', err);
  else     console.log('Pipeline succeeded');
});

// ── Custom Transform stream (uppercase transformer) ───────────
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});
process.stdin.pipe(upperCase).pipe(process.stdout);

// ── HTTP response as a stream ─────────────────────────────────
const http = require('http');
http.get('http://example.com/large-file', (response) => {
  const writeStream = fs.createWriteStream('downloaded.bin');
  pipeline(response, writeStream, (err) => {
    if (!err) console.log('Download complete');
  });
});
"""),
]

story += [
    Q(84, "Explain the cluster module in Node.js"),
    body_p("Node.js runs on a single thread. The cluster module allows you to create child processes (workers) that share the same server port, enabling you to use all CPU cores. The master process forks workers and distributes incoming connections among them. PM2 is a popular process manager that handles clustering automatically."),
    code("""
const cluster = require('cluster');
const os      = require('os');
const express = require('express');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master PID ${process.pid} — forking ${numCPUs} workers`);

  // Fork one worker per CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart dead workers
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.pid} died — restarting...`);
    cluster.fork();
  });

  // Inter-process communication
  cluster.on('online', worker => {
    worker.on('message', msg => {
      if (msg.type === 'log') console.log(`Worker ${worker.id}:`, msg.data);
    });
  });

} else {
  // Each worker runs its own Express server
  const app = express();
  app.get('/', (req, res) => {
    res.json({ pid: process.pid, message: 'Hello from worker' });
  });
  app.listen(3000, () => {
    console.log(`Worker ${process.pid} listening on 3000`);
    process.send({ type: 'log', data: 'Worker started' });
  });
}

// ── PM2 alternative (simpler) ────────────────────────────────
// package.json:
// "start": "pm2 start app.js -i max --name my-api"
// pm2 start app.js -i max  — auto-uses all cores
// pm2 monit               — real-time monitoring
// pm2 reload my-api        — zero-downtime restart
"""),
]

story += [
    Q(85, "What is middleware in Express.js?"),
    body_p("Middleware functions are functions that have access to the request (req), response (res), and the next middleware function (next). They form a chain — each middleware can modify req/res, end the request, or call next() to pass control to the next middleware. Middleware runs in the order it is defined."),
    code("""
const express = require('express');
const app     = express();

// ── Built-in middleware ───────────────────────────────────────
app.use(express.json());          // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.static('public')); // serve static files

// ── Custom middleware: request logger ────────────────────────
const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now()-start}ms`);
  });
  next();  // MUST call next or the request hangs
};
app.use(logger);

// ── Auth middleware ───────────────────────────────────────────
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Route-level middleware ────────────────────────────────────
app.get('/profile', requireAuth, (req, res) => {
  res.json(req.user);
});

// ── Error-handling middleware (4 params) ──────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
  });
});
"""),
]

story += [
    Q(86, "How do you handle errors in Express.js?"),
    body_p("Express has synchronous and asynchronous error handling. Synchronous errors can be thrown directly. For async errors, you must either call next(error) manually or use a wrapper utility. A central error handler middleware at the end of the chain catches all errors."),
    code("""
// ── Async error wrapper utility ───────────────────────────────
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
// With express 5.x, async errors auto-propagate without this

// ── Custom error classes ──────────────────────────────────────
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
class NotFoundError extends AppError {
  constructor(resource) { super(`${resource} not found`, 404); }
}
class ValidationError extends AppError {
  constructor(msg) { super(msg, 400); }
}

// ── Route using asyncHandler ──────────────────────────────────
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));

// ── Centralized error handler (must be last middleware) ────────
app.use((err, req, res, next) => {
  let { statusCode = 500, message, isOperational } = err;

  // Log unexpected errors
  if (!isOperational) {
    console.error('UNEXPECTED ERROR:', err);
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    status:  statusCode < 500 ? 'fail' : 'error',
    message: process.env.NODE_ENV === 'production' && !isOperational
             ? 'Internal server error' : message
  });
});

// ── Handle unhandled rejections & exceptions ──────────────────
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
"""),
]

story += [
    Q(87, "What is the difference between require and import?"),
    body_p("require is CommonJS (CJS) — Node.js's original module system. It is synchronous, dynamic (can be called conditionally at runtime), and evaluates the module at runtime. import is ES Modules (ESM) — the JavaScript standard. It is asynchronous, static (must be at top level), evaluated at parse time (enabling tree-shaking), and supports top-level await. Modern Node.js (12+) supports both."),
    code("""
// ── CommonJS (require) ────────────────────────────────────────
// math.js
function add(a, b) { return a + b; }
module.exports = { add };
// Or: exports.add = (a, b) => a + b;

// app.js
const { add } = require('./math');           // synchronous
const path     = require('path');            // built-in

// Dynamic require (useful for plugins):
const plugin = require(`./plugins/${name}`); // computed at runtime

// ── ES Modules (import) ───────────────────────────────────────
// math.mjs  (or package.json: "type": "module")
export function add(a, b) { return a + b; }
export default class Calculator { }

// app.mjs
import Calculator, { add } from './math.mjs';  // static
import * as mathUtils from './math.mjs';        // namespace import

// Dynamic import (lazy loading — returns a Promise):
const { add } = await import('./math.mjs');

// ── Interop ───────────────────────────────────────────────────
// CJS can be imported into ESM:
import cjsModule from './legacy.cjs';    // works

// ESM cannot be require()'d from CJS — must use dynamic import:
// const esmModule = require('./new.mjs');  // Error!
const esmModule = await import('./new.mjs');  // OK

// ── Node.js package.json configuration ───────────────────────
{
  "type": "module",        // treat .js as ESM
  "exports": {
    ".": {
      "import": "./dist/index.mjs",    // ESM entry
      "require": "./dist/index.cjs"    // CJS entry
    }
  }
}
"""),
]

story += [
    Q(88, "How do you handle file uploads in Node.js?"),
    body_p("Multipart form data containing files needs special parsing. Multer is the standard Express middleware for handling multipart/form-data. For production, files are typically stored in cloud storage (AWS S3, Cloudinary) rather than the server's file system."),
    code("""
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sharp   = require('sharp');   // image processing

// ── Memory storage (for immediate processing/upload to S3) ────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
  fileFilter(req, file, cb) {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error('Images only!'), ext && mime);
  }
});

const s3 = new S3Client({ region: process.env.AWS_REGION });

// ── Upload avatar to S3 with resize ──────────────────────────
app.post('/api/avatar', upload.single('avatar'), async (req, res) => {
  try {
    // Resize image before upload
    const processed = await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const key = `avatars/${req.user.id}-${Date.now()}.webp`;
    await s3.send(new PutObjectCommand({
      Bucket:      process.env.S3_BUCKET,
      Key:         key,
      Body:        processed,
      ContentType: 'image/webp',
      ACL:         'public-read',
    }));

    const url = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
    await User.findByIdAndUpdate(req.user.id, { avatar: url });
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

// ── Multiple files ────────────────────────────────────────────
app.post('/api/gallery', upload.array('photos', 10), async (req, res) => {
  const urls = await Promise.all(
    req.files.map(file => uploadToS3(file))
  );
  res.json({ urls });
});
"""),
]

story += [
    Q(89, "What is libuv in Node.js?"),
    body_p("libuv is the C library that provides Node.js with its event loop, thread pool, and cross-platform async I/O support. It abstracts different OS async mechanisms (epoll on Linux, kqueue on macOS, IOCP on Windows) into a unified API. The thread pool (default size 4, configurable via UV_THREADPOOL_SIZE) handles file system operations, DNS lookups, crypto, and zlib — operations that cannot be done with non-blocking OS APIs."),
    code("""
// libuv thread pool is used transparently by these operations:

const fs     = require('fs');
const crypto = require('crypto');
const dns    = require('dns');

// ── These use the thread pool (blocking in worker threads) ────
fs.readFile('file.txt', cb);           // file I/O
dns.lookup('example.com', cb);         // DNS resolution
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', cb);  // CPU-intensive crypto

// ── These use OS non-blocking APIs (no thread pool) ──────────
const net = require('net');
const server = net.createServer();     // TCP sockets — OS async
server.listen(3000);

const http = require('http');
http.get('http://example.com', cb);    // HTTP — socket-based, no thread pool

// ── Increasing thread pool for I/O heavy apps ─────────────────
// In your start script or .env:
// UV_THREADPOOL_SIZE=16 node app.js

// Or programmatically (must be set before any libuv operations):
process.env.UV_THREADPOOL_SIZE = 16;

// ── Checking event loop utilization ──────────────────────────
const { monitorEventLoopDelay } = require('perf_hooks');
const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();
setTimeout(() => {
  h.disable();
  console.log('Event loop mean delay:', h.mean / 1e6, 'ms');
  console.log('Max delay:', h.max / 1e6, 'ms');
}, 5000);
"""),
]

story += [
    Q(90, "How do you prevent callback hell in Node.js?"),
    body_p("Callback hell (or pyramid of doom) is deeply nested callbacks that make code hard to read and error-prone. Solutions: use Promises (then chains), async/await, modularize callbacks into named functions, use utility libraries."),
    code("""
// ── Callback hell (the problem) ───────────────────────────────
db.query('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
  if (err) return handleError(err);
  db.query('SELECT * FROM orders WHERE user_id = ?', [user.id], (err, orders) => {
    if (err) return handleError(err);
    db.query('SELECT * FROM products WHERE id = ?', [orders[0].productId], (err, product) => {
      if (err) return handleError(err);
      // 3 levels deep and growing...
      sendResponse({ user, orders, product });
    });
  });
});

// ── Solution 1: Promises ──────────────────────────────────────
db.queryAsync('SELECT * FROM users WHERE id = ?', [userId])
  .then(user   => Promise.all([user, db.queryAsync('SELECT ...', [user.id])]))
  .then(([user, orders]) => sendResponse({ user, orders }))
  .catch(handleError);

// ── Solution 2: async/await (cleanest) ───────────────────────
async function getUserData(userId) {
  try {
    const user    = await db.queryAsync('SELECT * FROM users WHERE id = ?', [userId]);
    const orders  = await db.queryAsync('SELECT * FROM orders WHERE user_id = ?', [user.id]);
    const product = await db.queryAsync('SELECT * FROM products WHERE id = ?', [orders[0].productId]);
    return { user, orders, product };
  } catch (err) {
    handleError(err);
  }
}

// ── Solution 3: util.promisify (convert callback APIs) ────────
const util = require('util');
const fs   = require('fs');
const readFile = util.promisify(fs.readFile);

async function readConfig() {
  const data = await readFile('./config.json', 'utf8');
  return JSON.parse(data);
}
// Or use fs.promises directly (modern Node.js):
const data = await fs.promises.readFile('./config.json', 'utf8');
"""),
]

# ── MONGODB ──────────────────────────────────────────────────────────────
story += section("ROUND 2 — MongoDB  (Q91–Q100)")

story += [
    Q(91, "What is a document in MongoDB?"),
    body_p("A document is the basic unit of data in MongoDB — equivalent to a row in SQL. Documents are stored in BSON (Binary JSON) format, which extends JSON to include additional data types (ObjectId, Date, Binary, etc.). Documents within a collection can have different fields (schemaless / dynamic schema), though Mongoose adds schema validation on the application side."),
    code("""
// A MongoDB document (shown as JSON):
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),  // auto-generated unique ID
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28,
  "address": {                          // embedded document
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "orders": [                           // array of embedded documents
    { "orderId": "ORD-001", "total": 99.99, "status": "shipped" },
    { "orderId": "ORD-002", "total": 149.99, "status": "pending" }
  ],
  "tags": ["premium", "early-adopter"],  // array of strings
  "createdAt": ISODate("2026-01-15T10:30:00Z"),
  "isActive": true
}

// ── BSON types not in regular JSON ────────────────────────────
// ObjectId       — 12-byte unique identifier
// Date/ISODate   — UTC datetime
// NumberLong     — 64-bit integer
// Binary/BinData — binary data (e.g., images)
// Decimal128     — high-precision decimal

// ── Mongoose schema (adds structure) ─────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  age:       { type: Number, min: 0, max: 120 },
  address:   { street: String, city: String, zipCode: String },
  orders:    [{ orderId: String, total: Number, status: String }],
  createdAt: { type: Date, default: Date.now }
});
"""),
]

story += [
    Q(92, "Difference between SQL and NoSQL databases"),
    body_p("SQL databases (PostgreSQL, MySQL) store data in structured tables with predefined schemas and enforce ACID transactions. They use SQL for queries and excel at complex joins and relational data. NoSQL databases (MongoDB, Redis, Cassandra) trade rigid schemas for flexibility, horizontal scalability, and performance for specific access patterns. MongoDB is document-oriented, Redis is key-value, Cassandra is wide-column."),
    code("""
// ── SQL — structured, relational ─────────────────────────────
// Users table:                Orders table:
// id | name | email           id | user_id | total | date
// ---|------|------           ---|---------|-------|-----
// 1  | Alice| a@e.com         1  | 1       | 99    | ...

// SQL query (JOIN):
// SELECT u.name, o.total FROM users u
// JOIN orders o ON u.id = o.user_id WHERE u.id = 1;

// ── MongoDB — document, flexible ─────────────────────────────
// users collection: (no JOIN needed — orders embedded or referenced)
{
  "_id": ObjectId("..."),
  "name": "Alice",
  "email": "a@example.com",
  "orders": [           // embedded (for 1-to-few)
    { "orderId": "o1", "total": 99 }
  ]
}

// ── When to use MongoDB ────────────────────────────────────────
// - Variable/evolving schema (user profiles, CMS content, catalogs)
// - Hierarchical/nested data structures (avoid joins)
// - High write throughput (social feeds, IoT sensor data, logs)
// - Need to scale horizontally across multiple servers (sharding)

// ── When to use PostgreSQL ────────────────────────────────────
// - Strong ACID requirements (banking, payments, orders)
// - Complex relationships with many joins (ERP, CRM)
// - Complex transactions across multiple tables
// - Need for strong consistency guarantees

// ── Mongoose CRUD operations ──────────────────────────────────
const User = mongoose.model('User', userSchema);

await User.create({ name: 'Alice', email: 'a@example.com' });
await User.find({ age: { $gte: 18 } }).sort({ name: 1 }).limit(10);
await User.findByIdAndUpdate(id, { $set: { name: 'Bob' } }, { new: true });
await User.deleteOne({ _id: id });
"""),
]

story += [
    Q(93, "What is indexing in MongoDB and why is it important?"),
    body_p("Without an index, MongoDB must scan every document in a collection (COLLSCAN) to find matching documents — O(n). Indexes store a sorted subset of data (like a book's index) allowing MongoDB to jump directly to relevant documents (IXSCAN) — O(log n). Without indexes on large collections, queries can be 1000x slower. Every collection gets a default index on _id."),
    code("""
// ── Creating indexes in MongoDB shell ────────────────────────
db.users.createIndex({ email: 1 });               // ascending single field
db.users.createIndex({ lastName: 1, firstName: 1 }); // compound index
db.users.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index
db.users.createIndex({ bio: 'text', name: 'text' });  // text search index
db.users.createIndex({ location: '2dsphere' });    // geospatial index

// ── Unique index ──────────────────────────────────────────────
db.users.createIndex({ email: 1 }, { unique: true }); // enforces uniqueness

// ── Partial index (only index active users) ───────────────────
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { isActive: true } }
);

// ── Mongoose index definitions ────────────────────────────────
const productSchema = new mongoose.Schema({
  name:     { type: String, index: true },          // basic index
  email:    { type: String, unique: true },          // unique index
  price:    Number,
  category: String,
  createdAt: { type: Date, expires: '30d' }          // TTL index
});
// Compound index in schema:
productSchema.index({ price: 1, category: 1 });
productSchema.index({ name: 'text', description: 'text' }); // full text

// ── Explain a query to check index usage ─────────────────────
const explain = await User.find({ email: 'alice@example.com' }).explain('executionStats');
console.log(explain.executionStats.executionStages.stage); // IXSCAN = uses index
// COLLSCAN = no index — add one!

// ── Index guidelines ─────────────────────────────────────────
// ESR rule: Equality fields first, Sort fields second, Range fields last
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 });
// Supports: find by userId+status, then sort by createdAt
"""),
]

story += [
    Q(94, "Explain the aggregation pipeline in MongoDB"),
    body_p("The aggregation pipeline is a framework for data transformation and analysis. Documents pass through a series of stages, each transforming the data. It is MongoDB's equivalent of SQL GROUP BY, JOIN, HAVING, and window functions. Stages execute in sequence, and MongoDB optimizes the pipeline automatically."),
    code("""
// ── Sales analytics pipeline ──────────────────────────────────
db.orders.aggregate([
  // Stage 1: Filter
  { $match: {
    createdAt: { $gte: new Date('2026-01-01') },
    status: 'completed'
  }},

  // Stage 2: Join with users collection
  { $lookup: {
    from:         'users',
    localField:   'userId',
    foreignField: '_id',
    as:           'user'
  }},
  { $unwind: '$user' },        // flatten the user array

  // Stage 3: Group and aggregate
  { $group: {
    _id:          '$user.country',
    totalRevenue: { $sum: '$total' },
    orderCount:   { $count: {} },
    avgOrder:     { $avg: '$total' },
    topOrder:     { $max: '$total' }
  }},

  // Stage 4: Add computed fields
  { $addFields: {
    revenuePerOrder: { $divide: ['$totalRevenue', '$orderCount'] }
  }},

  // Stage 5: Sort
  { $sort: { totalRevenue: -1 } },

  // Stage 6: Limit
  { $limit: 10 },

  // Stage 7: Shape output
  { $project: {
    country:     '$_id',
    revenue:     '$totalRevenue',
    orders:      '$orderCount',
    avgRevenue:  { $round: ['$revenuePerOrder', 2] },
    _id: 0
  }}
]);

// ── Mongoose aggregation ──────────────────────────────────────
const result = await Order.aggregate([
  { $match: { userId: mongoose.Types.ObjectId(userId) } },
  { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
]);
"""),
]

story += [
    Q(95, "What is sharding in MongoDB?"),
    body_p("Sharding is MongoDB's horizontal scaling strategy that distributes data across multiple machines (shards). Each shard is a replica set that holds a subset of the data. A mongos router directs queries to the appropriate shard(s) based on the shard key. Config servers store the cluster metadata."),
    code("""
// ── Sharding architecture ─────────────────────────────────────
// Client -> mongos (router) -> [Shard 1, Shard 2, Shard 3]
//                           -> Config Servers (metadata)

// ── Enabling sharding ─────────────────────────────────────────
// In mongo shell:
sh.enableSharding("ecommerce");                   // enable on database
sh.shardCollection("ecommerce.orders", { userId: 1 }); // shard key

// ── Choosing a shard key — critical decision ──────────────────
// Good shard key properties:
// 1. High cardinality (many unique values)
// 2. Evenly distributed writes (avoid hot spots)
// 3. Commonly used in queries (mongos can route to one shard)

// BAD: { status: 1 }    — only a few values, hot spot
// BAD: { timestamp: 1 } — monotonically increasing, all writes go to last shard
// GOOD: { userId: 1 }   — high cardinality, well distributed
// GOOD: { _id: "hashed" } — hash-based, guaranteed even distribution

sh.shardCollection("ecommerce.events", { _id: "hashed" });

// ── Checking shard distribution ───────────────────────────────
db.orders.getShardDistribution();
sh.status();

// ── Real-world consideration ──────────────────────────────────
// Sharding adds operational complexity. Before sharding:
// 1. Add more RAM (most queries hit the working set)
// 2. Add indexes (single-server optimization)
// 3. Use replica sets for read scaling
// 4. Only shard when data exceeds single-server capacity (~TB scale)
"""),
]

story += [
    Q(96, "How do you handle relationships in MongoDB? (embedding vs referencing)"),
    body_p("MongoDB offers two strategies for relationships. Embedding (denormalization): store related data inside the same document. Best for data that is always read together, rarely changes, and has limited growth. Referencing (normalization): store references (_id) to documents in other collections and use $lookup or Mongoose populate. Best for large sub-documents, frequently updating related data, or many-to-many relationships."),
    code("""
// ── Embedding (1-to-few, read together) ──────────────────────
const blogPostSchema = new mongoose.Schema({
  title:   String,
  content: String,
  author:  {                       // embedded — always fetched with post
    name:  String,
    email: String,
    avatar: String
  },
  comments: [{                     // embedded — but limit growth!
    text:      String,
    author:    String,
    createdAt: Date
  }]
});

// ── Referencing (1-to-many, large data, frequently updated) ──
const orderSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // ref
  productIds:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  total:     Number,
  status:    String
});

// Mongoose populate (JOIN equivalent):
const orders = await Order
  .find({ status: 'pending' })
  .populate('userId',     'name email')
  .populate('productIds', 'name price image');

// ── Hybrid approach (denormalize frequently read fields) ──────
const orderItemSchema = new mongoose.Schema({
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // Denormalized fields (snapshot at time of order):
  productName: String,   // cached — no join needed for order history
  productImage:String,
  price:       Number,   // locked in at order time
  quantity:    Number,
});
"""),
]

story += [
    Q(97, "What is Mongoose and why is it used?"),
    body_p("Mongoose is an ODM (Object Document Mapper) for Node.js and MongoDB. It provides: schema definition with validation and type casting, built-in methods for CRUD operations, middleware (pre/post hooks), virtuals (computed properties), population (reference joining), and a Query builder API. It brings structure and safety to MongoDB's flexible schema model."),
    code(r"""
const mongoose = require('mongoose');

// ── Schema with validation, defaults, and indexes ─────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Name required'], trim: true, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true,
              match: [/^[^@]+@[^@]+\.[^@]+$/, 'Invalid email'] },
  password: { type: String, required: true, select: false },  // hidden by default
  role:     { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  avatar:   { type: String, default: 'default-avatar.png' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });  // auto createdAt + updatedAt

// ── Virtuals — computed properties (not stored in DB) ─────────
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.virtual('posts', {        // virtual populate
  ref:          'Post',
  localField:   '_id',
  foreignField: 'authorId'
});

// ── Middleware (pre/post hooks) ───────────────────────────────
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.post('find', function(docs) {
  console.log(`Found ${docs.length} users`);
});

// ── Instance methods ──────────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Static methods ────────────────────────────────────────────
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);
"""),
]

story += [
    Q(98, "How do you perform transactions in MongoDB?"),
    body_p("Multi-document ACID transactions were introduced in MongoDB 4.0 (replica sets) and 4.2 (sharded clusters). They allow multiple operations across multiple documents/collections to be atomic. Like SQL transactions, they either all succeed or all roll back. Use them for operations where consistency across multiple documents is required (e.g., transferring money, creating order + reducing inventory)."),
    code("""
const mongoose = require('mongoose');

// ── Mongoose session transaction ──────────────────────────────
async function transferFunds(fromId, toId, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // All operations use the same session — atomic together
    const fromAccount = await Account.findById(fromId).session(session);
    if (fromAccount.balance < amount) throw new Error('Insufficient funds');

    await Account.findByIdAndUpdate(
      fromId,
      { $inc: { balance: -amount } },
      { session, new: true }
    );
    await Account.findByIdAndUpdate(
      toId,
      { $inc: { balance: amount } },
      { session, new: true }
    );
    await Transaction.create([{
      fromAccount: fromId, toAccount: toId, amount,
      timestamp: new Date(), type: 'transfer'
    }], { session });

    await session.commitTransaction();
    console.log('Transfer successful');
  } catch (error) {
    await session.abortTransaction();  // rolls back ALL changes
    throw error;
  } finally {
    session.endSession();
  }
}

// ── withTransaction helper (handles retry logic) ──────────────
async function placeOrder(userId, cartItems) {
  const session = await mongoose.startSession();
  await session.withTransaction(async () => {
    // Check and reserve inventory for each item
    for (const item of cartItems) {
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );
      if (!product) throw new Error(`${item.name} out of stock`);
    }
    await Order.create([{ userId, items: cartItems, status: 'confirmed' }], { session });
  });
  session.endSession();
}
"""),
]

story += [
    Q(99, "What is the difference between find() and findOne()?"),
    body_p("find() returns a Query cursor that can match multiple documents. It returns an array (or empty array if none match). findOne() returns the first document that matches, or null if none match. findOne() is equivalent to find().limit(1) but is more explicit and stops after the first match."),
    code("""
const User = require('./models/User');

// ── find() — returns array ────────────────────────────────────
const admins = await User.find({ role: 'admin' });
// Returns: [] if none, or [user1, user2, ...]

// With query operators
const users = await User.find({
  age:     { $gte: 18, $lte: 65 },
  isActive: true,
  role:    { $in: ['user', 'moderator'] }
})
.select('name email role')          // project only these fields
.sort({ createdAt: -1 })            // newest first
.skip(20)                           // pagination skip
.limit(10)                          // max 10 results
.lean();                            // return plain JS objects (faster, no Mongoose methods)

// ── findOne() — returns single document or null ───────────────
const user = await User.findOne({ email: 'alice@example.com' });
if (!user) throw new Error('User not found');

// ── findById() — shorthand for findOne({ _id: id }) ──────────
const user2 = await User.findById('507f1f77bcf86cd799439011');

// ── findByIdAndUpdate() — atomic find + update ────────────────
const updated = await User.findByIdAndUpdate(
  id,
  { $set: { name: 'Alice Smith' }, $push: { tags: 'premium' } },
  { new: true, runValidators: true }  // new: return updated doc
);

// ── findOneAndDelete() ────────────────────────────────────────
const deleted = await User.findOneAndDelete({ email: 'spam@example.com' });

// ── Counting ──────────────────────────────────────────────────
const count = await User.countDocuments({ isActive: true });
// Or: User.find({ isActive: true }).count() (deprecated — use countDocuments)
"""),
]

story += [
    Q(100, "How do you create an index in MongoDB?"),
    body_p("Indexes improve query performance dramatically on large collections. The createIndex() method is the standard way. You can also define indexes in Mongoose schemas. Always analyze your query patterns before adding indexes — each index has storage and write-performance costs."),
    code("""
// ── MongoDB shell commands ────────────────────────────────────
// Single field
db.users.createIndex({ email: 1 });            // ascending
db.users.createIndex({ createdAt: -1 });       // descending

// Compound (covers multi-field queries + sorts)
db.orders.createIndex({ userId: 1, status: 1, createdAt: -1 });

// Unique constraint
db.users.createIndex({ email: 1 }, { unique: true });

// Sparse (only index docs where field exists)
db.profiles.createIndex({ linkedinUrl: 1 }, { sparse: true });

// Background (don't block reads/writes during creation)
db.events.createIndex({ timestamp: 1 }, { background: true });

// TTL (auto-delete documents after expiry)
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// expiresAt is a Date field — document deleted when Date is past

// Full-text search
db.articles.createIndex({ title: 'text', content: 'text' },
                        { weights: { title: 10, content: 1 } });

// ── Viewing and managing indexes ──────────────────────────────
db.users.getIndexes();      // list all indexes
db.users.dropIndex({ email: 1 });

// ── Checking if a query uses an index ─────────────────────────
db.users.find({ email: 'a@b.com' }).explain('executionStats');
// Look for: winningPlan.stage === 'IXSCAN'  (good — uses index)
// Avoid:    winningPlan.stage === 'COLLSCAN' (bad — full scan)

// ── Mongoose schema index definition ─────────────────────────
const orderSchema = new mongoose.Schema({ ... });
orderSchema.index({ userId: 1, status: 1 });   // compound
orderSchema.index({ 'items.productId': 1 });   // nested field
// Call mongoose.syncIndexes() or use { autoIndex: true } in connection
"""),
]

# ── EXPRESS ────────────────────────────────────────────────────────────
story += section("ROUND 2 — Express.js  (Q101–Q108)")

story += [
    Q(101, "What is Express.js and why is it used?"),
    body_p("Express is a minimal, unopinionated web framework for Node.js. It provides a thin layer of web application features on top of Node's built-in HTTP module: routing, middleware, request/response helpers, and template engine support. It is the most popular Node.js framework, used directly or as the foundation for frameworks like NestJS, Feathers, and LoopBack."),
    code("""
const express = require('express');
const app     = express();

// ── Setup ─────────────────────────────────────────────────────
app.use(express.json());                   // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse URL-encoded
app.use(require('cors')());                // enable CORS
app.use(require('helmet')());              // security headers

// ── Routes ────────────────────────────────────────────────────
app.get(   '/api/users',      getUsers);
app.get(   '/api/users/:id',  getUserById);
app.post(  '/api/users',      createUser);
app.put(   '/api/users/:id',  replaceUser);
app.patch( '/api/users/:id',  updateUser);
app.delete('/api/users/:id',  deleteUser);

// ── Route parameters and query strings ────────────────────────
app.get('/api/products', async (req, res) => {
  const { page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
  const filters = {};
  if (category) filters.category = category;
  if (minPrice || maxPrice) filters.price = {};
  if (minPrice) filters.price.$gte = Number(minPrice);
  if (maxPrice) filters.price.$lte = Number(maxPrice);

  const products = await Product.find(filters)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ data: products, page: Number(page), limit: Number(limit) });
});

app.listen(3000, () => console.log('Server running on port 3000'));
"""),
]

story += [
    Q(102, "How do you set up routing in Express.js?"),
    body_p("Express supports inline routing (app.get/post etc.) and Router — a mini Express app for modular routing. For larger applications, use express.Router() to group related routes into separate files, then mount them on the main app."),
    code("""
// ── routes/users.js ───────────────────────────────────────────
const router = require('express').Router();
const { requireAuth, isAdmin } = require('../middleware/auth');
const UserController = require('../controllers/userController');

// All routes in this file are prefixed with /api/users
router.get(   '/',         requireAuth, UserController.getAll);
router.get(   '/:id',      requireAuth, UserController.getById);
router.post(  '/',         isAdmin,     UserController.create);
router.patch( '/:id',      requireAuth, UserController.update);
router.delete('/:id',      isAdmin,     UserController.delete);

// Nested resource: /api/users/:userId/posts
router.get('/:userId/posts', UserController.getUserPosts);

module.exports = router;

// ── app.js — mount routers ────────────────────────────────────
const app = require('express')();
app.use('/api/users',    require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/auth',     require('./routes/auth'));

// ── controllers/userController.js — separation of concerns ────
const UserController = {
  getAll: async (req, res, next) => {
    try {
      const users = await User.find({ isActive: true });
      res.json({ status: 'success', data: users });
    } catch (err) { next(err); }
  },
  getById: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) { next(err); }
  }
};
"""),
]

story += [
    Q(103, "What is middleware and how does the middleware chain work?"),
    body_p("Already covered in Q85. To add more depth — middleware in Express processes requests in the order they are defined. Each middleware receives (req, res, next). Calling next() passes control to the next matching middleware or route handler. Not calling next() (without sending a response) will cause the request to hang. Calling next(error) skips all regular middleware and goes to the error handler."),
    code("""
const express = require('express');
const app     = express();

// ── Middleware execution order visualization ──────────────────
// Request comes in -> [logger] -> [auth] -> [route handler] -> [error handler]

// 1. Logger (all routes)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 2. Rate limiter (all routes)
const rateLimit = require('express-rate-limit');
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 3. Route-specific middleware (only /admin routes)
app.use('/admin', requireAdmin);

// 4. Route handler
app.get('/admin/users', (req, res) => {
  res.json(users);
});

// ── next('route') — skip remaining middleware in current router ──
app.get('/api/items',
  checkCache,          // if cache hit, calls next('route')
  fetchFromDB,         // only runs on cache miss
);

function checkCache(req, res, next) {
  const cached = cache.get(req.url);
  if (cached) return res.json(cached);  // respond from cache
  next();                               // cache miss — continue chain
}

// ── Error propagation ─────────────────────────────────────────
app.get('/risky', async (req, res, next) => {
  try {
    const result = await riskyOperation();
    res.json(result);
  } catch (err) {
    next(err);   // jumps to error handler
  }
});
"""),
]

story += [
    Q(104, "Difference between app.use() and app.get()"),
    body_p("app.use() is for mounting middleware and sub-routers. It matches ANY HTTP method (GET, POST, PUT, etc.) and uses prefix matching — the path only needs to START with the given path. app.get() (and app.post(), app.put() etc.) are for specific HTTP methods and exact path matching (with params)."),
    code("""
// app.use() — matches any method, prefix match
app.use('/api', router);    // matches /api, /api/users, /api/products/123
app.use(cors());            // no path = matches everything
app.use('/static', express.static('public'));  // serve /static/img.png etc.

// app.get() — only GET, exact match (params still flexible)
app.get('/api/users',       handler);  // only GET /api/users
app.get('/api/users/:id',   handler);  // only GET /api/users/123

// ── Practical difference ──────────────────────────────────────
app.use('/protected', (req, res, next) => {
  // Runs for GET /protected/anything, POST /protected/anything, etc.
  if (!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized' });
  next();
});

// These all fall under the /protected middleware above:
app.get(   '/protected/profile',  getProfile);
app.post(  '/protected/posts',    createPost);
app.delete('/protected/posts/:id',deletePost);

// ── app.all() — matches all methods but exact path ────────────
app.all('/api/*', rateLimiter);   // all methods, any /api/ path
"""),
]

story += [
    Q(105, "How do you implement authentication using JWT in Express?"),
    body_p("JWT (JSON Web Token) authentication uses signed tokens. The client logs in, receives an access token (short-lived) and refresh token (long-lived, stored in httpOnly cookie). On each request, the client sends the access token in the Authorization header. The server verifies the signature without hitting the database. When the access token expires, the client uses the refresh token to get a new one."),
    code("""
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// ── Login: issue tokens ───────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken  = jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Refresh token in httpOnly cookie (inaccessible to JS — XSS protection)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000
  });

  res.json({ accessToken, user: { id: user._id, name: user.name } });
});

// ── Auth middleware ───────────────────────────────────────────
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ error: 'Token expired' });
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ── Refresh token endpoint ────────────────────────────────────
app.post('/api/auth/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const payload     = jwt.verify(token, REFRESH_SECRET);
    const accessToken = jwt.sign({ id: payload.id }, ACCESS_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
"""),
]

story += [
    Q(106, "What is CORS and how do you enable it in Express?"),
    body_p("CORS (Cross-Origin Resource Sharing) is a browser security mechanism that restricts web pages from making requests to a different origin (domain, protocol, or port) than the one that served the page. The server must send CORS headers to tell the browser which origins are allowed. Express's cors package simplifies this."),
    code("""
const cors    = require('cors');
const express = require('express');
const app     = express();

// ── Allow all origins (development only!) ────────────────────
app.use(cors());

// ── Production: specific origins ─────────────────────────────
const allowedOrigins = [
  'https://myapp.com',
  'https://www.myapp.com',
  'https://admin.myapp.com'
];

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods:          ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders:   ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders:   ['X-Total-Count'],  // headers accessible to client JS
  credentials:      true,              // allow cookies (needed for JWT cookies)
  maxAge:           86400              // preflight cache: 24 hours
}));

// ── Manual CORS (without package) ────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204); // preflight
  next();
});
"""),
]

story += [
    Q(107, "How do you handle file uploads using Multer?"),
    body_p("Already covered in Q88 (Node.js section). Additional Express-specific details: Multer integrates as Express middleware and handles the multipart/form-data parsing. The uploaded file is available on req.file (single) or req.files (multiple). Always validate file type, size, and sanitize filenames in production."),
    code("""
const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');

// ── Disk storage with custom filename ────────────────────────
const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Sanitize: random name to prevent path traversal
    const random  = crypto.randomBytes(16).toString('hex');
    const ext     = path.extname(file.originalname).toLowerCase();
    cb(null, `${random}${ext}`);
  }
});

const upload = multer({
  storage: diskStorage,
  limits:  { fileSize: 10 * 1024 * 1024, files: 5 },  // 10MB, max 5 files
  fileFilter(req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  }
});

// ── Single file upload ────────────────────────────────────────
app.post('/api/upload/avatar', requireAuth, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ── Multiple files (different fields) ────────────────────────
app.post('/api/upload/resume',
  upload.fields([
    { name: 'cv',     maxCount: 1 },
    { name: 'cover',  maxCount: 1 }
  ]),
  (req, res) => {
    const cv    = req.files['cv']?.[0];
    const cover = req.files['cover']?.[0];
    res.json({ cv: cv?.filename, cover: cover?.filename });
  }
);

// ── Error handling for Multer errors ─────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large' });
  }
  next(err);
});
"""),
]

story += [
    Q(108, "What is the difference between HTTP PUT and PATCH methods?"),
    body_p("PUT is an idempotent method that replaces the ENTIRE resource at the given URL with the request body. If you PUT with only some fields, missing fields are set to null/removed. PATCH is a partial update — only the fields in the request body are updated. PATCH is more bandwidth-efficient and safer for partial updates."),
    code("""
// ── Current user in DB ────────────────────────────────────────
// { _id: "123", name: "Alice", email: "alice@e.com", age: 28, role: "admin" }

// PUT /api/users/123 { name: "Alice Smith" }
// Replaces entire document:
// { _id: "123", name: "Alice Smith", email: null, age: null, role: null }  DANGEROUS!

// PATCH /api/users/123 { name: "Alice Smith" }
// Only updates name field:
// { _id: "123", name: "Alice Smith", email: "alice@e.com", age: 28, role: "admin" }

// ── Express implementation ────────────────────────────────────
const router = require('express').Router();

// PUT — full replace (must provide all fields)
router.put('/:id', requireAuth, async (req, res, next) => {
  const { name, email, age, bio } = req.body;  // extract ALL fields
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, age, bio },    // explicit full replacement
    { new: true, runValidators: true, overwrite: true }
  );
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// PATCH — partial update (only update provided fields)
router.patch('/:id', requireAuth, async (req, res, next) => {
  // Remove undefined fields from body
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([_, v]) => v !== undefined)
  );
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },            // $set only updates provided fields
    { new: true, runValidators: true }
  );
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});
"""),
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ROUND 3 — SYSTEM DESIGN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
story += section("ROUND 3 — System Design & Architecture  (Q109–Q129)")

story += [
    Q(109, "Design a URL shortener (like bit.ly) using MERN/MEAN stack"),
    body_p("A URL shortener maps a long URL to a short code. Requirements: generate unique short codes, redirect short URLs to originals, handle high read traffic, track click analytics. Architecture: Node/Express API, MongoDB for storage, Redis cache for hot URLs, base62 encoding for codes."),
    code("""
// ── MongoDB Schema ────────────────────────────────────────────
const urlSchema = new mongoose.Schema({
  shortCode:   { type: String, unique: true, index: true },
  originalUrl: { type: String, required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clicks:      { type: Number, default: 0 },
  expiresAt:   { type: Date, index: { expireAfterSeconds: 0 } },
}, { timestamps: true });
const Url = mongoose.model('Url', urlSchema);

// ── Base62 encoding ───────────────────────────────────────────
const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function toBase62(num) {
  let result = '';
  while (num > 0) {
    result = CHARS[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result.padStart(6, '0');
}

// ── Auto-incrementing counter (for unique IDs) ────────────────
const counterSchema = new mongoose.Schema({ seq: Number });
async function getNextId() {
  const counter = await Counter.findByIdAndUpdate(
    'url', { $inc: { seq: 1 } }, { new: true, upsert: true }
  );
  return counter.seq;
}

// ── Create short URL ──────────────────────────────────────────
app.post('/api/shorten', requireAuth, async (req, res) => {
  const { originalUrl, customCode, expiryDays } = req.body;

  // Validate URL
  try { new URL(originalUrl); } catch { return res.status(400).json({ error: 'Invalid URL' }); }

  let shortCode = customCode;
  if (!shortCode) {
    const id = await getNextId();
    shortCode = toBase62(id);
  }
  if (await Url.exists({ shortCode })) {
    return res.status(409).json({ error: 'Code taken' });
  }

  const url = await Url.create({
    shortCode, originalUrl, userId: req.user.id,
    expiresAt: expiryDays ? new Date(Date.now() + expiryDays * 86400000) : undefined
  });
  res.json({ shortUrl: `https://sho.rt/${shortCode}`, url });
});

// ── Redirect (high traffic — cache with Redis) ────────────────
const redis = require('redis').createClient({ url: process.env.REDIS_URL });

app.get('/:code', async (req, res) => {
  const { code } = req.params;

  // Check Redis cache first (O(1))
  const cached = await redis.get(`url:${code}`);
  if (cached) {
    // Async increment (don't wait)
    Url.findOneAndUpdate({ shortCode: code }, { $inc: { clicks: 1 } }).exec();
    return res.redirect(301, cached);
  }

  const url = await Url.findOneAndUpdate(
    { shortCode: code },
    { $inc: { clicks: 1 } },
    { new: true }
  );
  if (!url) return res.status(404).send('Short URL not found');
  if (url.expiresAt && url.expiresAt < new Date())
    return res.status(410).send('URL expired');

  // Cache for 1 hour
  await redis.setEx(`url:${code}`, 3600, url.originalUrl);
  res.redirect(301, url.originalUrl);
});
"""),
]

story += [
    Q(110, "How would you design a real-time chat application?"),
    body_p("Real-time chat requires bidirectional communication between server and clients. Architecture: Socket.io for WebSocket connections, Redis Pub/Sub adapter to share messages across multiple Node instances, MongoDB for persistent message storage, rooms/channels for group chat, JWT for socket authentication."),
    code("""
// ── Server setup ──────────────────────────────────────────────
const express   = require('express');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redis     = require('redis');

const app    = express();
const server = require('http').createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true }
});

// ── Redis adapter (scales to multiple Node instances) ─────────
const pubClient = redis.createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));

// ── JWT auth middleware for sockets ───────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

// ── Message model ─────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
  roomId:    { type: String, index: true },
  sender:    { userId: String, name: String, avatar: String },
  content:   { type: String, maxlength: 2000 },
  type:      { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  readBy:    [String],
}, { timestamps: true });

// ── Socket connection handler ──────────────────────────────────
io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected`);

  // Join a room (chat channel)
  socket.on('join:room', async ({ roomId }) => {
    socket.join(roomId);

    // Send last 50 messages
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 }).limit(50).lean();
    socket.emit('messages:history', messages.reverse());

    // Notify others
    socket.to(roomId).emit('user:joined', { user: socket.user, roomId });
  });

  // Send message
  socket.on('message:send', async ({ roomId, content, type = 'text' }) => {
    const message = await Message.create({
      roomId, content, type,
      sender: { userId: socket.user.id, name: socket.user.name }
    });
    // Broadcast to everyone in room (including sender)
    io.to(roomId).emit('message:new', message);
  });

  // Typing indicator
  socket.on('typing:start', ({ roomId }) => {
    socket.to(roomId).emit('typing:start', { user: socket.user.name, roomId });
  });

  socket.on('disconnect', () => {
    io.emit('user:offline', { userId: socket.user.id });
  });
});
"""),
]

story += [
    Q(112, "How do you implement pagination in a MERN app?"),
    body_p("There are two main pagination strategies: offset/limit (page-based) and cursor-based. Offset pagination is simple but slow on large datasets (SKIP is O(n)). Cursor pagination uses the last document's ID to fetch the next page — O(log n) with a proper index. Use cursor for high-scale feeds, offset for admin tables."),
    code("""
// ── Offset pagination ─────────────────────────────────────────
// GET /api/products?page=3&limit=20&sort=-createdAt&category=books
app.get('/api/products', async (req, res) => {
  const { page = 1, limit = 20, sort = '-createdAt', category } = req.query;
  const filters = category ? { category } : {};
  const skip    = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(filters)
  ]);

  res.json({
    data,
    pagination: {
      page:       Number(page),
      limit:      Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext:    page < Math.ceil(total / limit),
      hasPrev:    page > 1,
    }
  });
});

// ── Cursor-based pagination (for infinite scroll / high scale) ─
// GET /api/feed?cursor=507f1f77bcf86cd799439011&limit=20
app.get('/api/feed', requireAuth, async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  const query = { userId: { $in: req.user.following } };

  if (cursor) query._id = { $lt: mongoose.Types.ObjectId(cursor) };

  const posts = await Post.find(query)
    .sort({ _id: -1 })      // newest first — uses default _id index
    .limit(Number(limit) + 1)  // fetch one extra to determine hasNext
    .lean();

  const hasNext = posts.length > limit;
  if (hasNext) posts.pop();

  res.json({
    data:     posts,
    hasNext,
    nextCursor: hasNext ? posts[posts.length - 1]._id : null,
  });
});

// ── React infinite scroll component ───────────────────────────
function Feed() {
  const [posts, setPosts]   = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (!hasNext || loading) return;
    setLoading(true);
    const url = cursor ? `/api/feed?cursor=${cursor}` : '/api/feed';
    const { data, nextCursor, hasNext: hn } = await fetchJSON(url);
    setPosts(prev => [...prev, ...data]);
    setCursor(nextCursor);
    setHasNext(hn);
    setLoading(false);
  };

  useEffect(() => { loadMore(); }, []);

  return <InfiniteScroll onEnd={loadMore} hasMore={hasNext}>
    {posts.map(p => <PostCard key={p._id} post={p} />)}
  </InfiniteScroll>;
}
"""),
]

story += [
    Q(113, "Explain microservices architecture vs monolithic — when to use which?"),
    body_p("A monolith is a single deployable unit where all modules run in the same process. Microservices splits the application into small, independent services that communicate over HTTP/gRPC/message queues. Each service owns its data and can be deployed independently."),
    body_p("Use monolith when: small team, new product (move fast), simple domain. Use microservices when: large team (Conway's Law), need to scale specific parts independently, different services need different tech stacks, or you need fault isolation."),
    code("""
// ── MONOLITH structure ────────────────────────────────────────
// src/
//   routes/      users.js, orders.js, products.js
//   models/      User.js, Order.js, Product.js
//   services/    emailService.js, paymentService.js
//   app.js       — single entry point

// ── MICROSERVICES structure ───────────────────────────────────
// services/
//   user-service/      port 3001  (users DB)
//   order-service/     port 3002  (orders DB)
//   product-service/   port 3003  (products DB)
//   notification-service/ port 3004
//   api-gateway/       port 3000  (single entry point for clients)

// ── API Gateway pattern ───────────────────────────────────────
const gateway = express();
const httpProxy = require('http-proxy-middleware');

gateway.use('/api/users',    httpProxy.createProxyMiddleware({ target: 'http://user-service:3001' }));
gateway.use('/api/orders',   httpProxy.createProxyMiddleware({ target: 'http://order-service:3002' }));
gateway.use('/api/products', httpProxy.createProxyMiddleware({ target: 'http://product-service:3003' }));

// ── Inter-service communication with message queue ─────────────
// Order service publishes event when order placed:
const amqp = require('amqplib');
async function publishOrderPlaced(order) {
  const conn    = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertExchange('orders', 'topic', { durable: true });
  channel.publish('orders', 'order.placed', Buffer.from(JSON.stringify(order)));
}

// Notification service subscribes to the event:
async function subscribeToOrders() {
  const channel = await getChannel();
  await channel.assertQueue('notifications.order-placed', { durable: true });
  await channel.bindQueue('notifications.order-placed', 'orders', 'order.placed');
  channel.consume('notifications.order-placed', async (msg) => {
    const order = JSON.parse(msg.content);
    await sendOrderConfirmationEmail(order);
    channel.ack(msg);
  });
}
"""),
]

story += [
    Q(115, "How would you implement rate limiting in a Node.js API?"),
    body_p("Rate limiting protects your API from abuse, DDoS attacks, and ensures fair usage. For single-server setups, express-rate-limit with in-memory store is sufficient. For multi-server (clustered or microservices), use Redis as the shared store so rate limit counters are consistent across all instances."),
    code("""
const rateLimit  = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis      = require('redis');

const redisClient = redis.createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

// ── General API rate limit ────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs:  15 * 60 * 1000,   // 15 minutes
  max:       100,              // 100 requests per window
  standardHeaders: true,       // Return rate limit info in headers
  legacyHeaders:   false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// ── Auth rate limit (stricter for login endpoint) ─────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,                 // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req) => `auth:${req.body.email || req.ip}`, // per email
});

// ── Apply ─────────────────────────────────────────────────────
app.use('/api/', generalLimiter);
app.use('/api/auth/login',  authLimiter);
app.use('/api/auth/forgot', authLimiter);

// ── Token bucket algorithm (custom Redis implementation) ──────
async function tokenBucketAllow(userId, capacity = 10, refillRate = 1) {
  const key   = `bucket:${userId}`;
  const now   = Date.now();
  const data  = await redis.hGetAll(key);
  let tokens  = parseFloat(data.tokens  || capacity);
  let lastRefill = parseFloat(data.lastRefill || now);

  // Refill tokens
  const elapsed = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + elapsed * refillRate);

  if (tokens < 1) return false;  // rate limited

  tokens -= 1;
  await redis.hSet(key, { tokens: tokens.toString(), lastRefill: now.toString() });
  await redis.expire(key, 3600);
  return true;  // request allowed
}
"""),
]

story += [
    Q(124, "What is Redis and how do you use caching in a Node.js app?"),
    body_p("Redis is an in-memory data structure store used as a cache, message broker, and queue. Its sub-millisecond latency makes it ideal for caching expensive database queries, session storage, rate limiting, and pub/sub. A cache-aside strategy: check Redis first, if miss hit the DB, store result in Redis with TTL."),
    code("""
const redis   = require('redis');
const client  = redis.createClient({ url: process.env.REDIS_URL });
await client.connect();

// ── Cache utility ─────────────────────────────────────────────
async function cacheGet(key) {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

async function cacheSet(key, value, ttlSeconds = 3600) {
  await client.setEx(key, ttlSeconds, JSON.stringify(value));
}

// ── Cache middleware factory ──────────────────────────────────
const cache = (ttl = 300) => async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;
  const hit = await cacheGet(key);
  if (hit) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(hit);
  }
  // Override res.json to capture and cache the response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cacheSet(key, data, ttl);
    res.setHeader('X-Cache', 'MISS');
    return originalJson(data);
  };
  next();
};

// Apply to routes:
app.get('/api/products',        cache(300),  getProducts);    // 5 min
app.get('/api/categories',      cache(3600), getCategories);  // 1 hour

// ── Cache invalidation ────────────────────────────────────────
async function invalidateProductCache(productId) {
  // Delete specific key
  await client.del(`cache:/api/products/${productId}`);
  // Delete all product list caches (pattern delete)
  const keys = await client.keys('cache:/api/products*');
  if (keys.length) await client.del(keys);
}

// ── Session storage in Redis ──────────────────────────────────
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store:  new RedisStore({ client }),
  secret: process.env.SESSION_SECRET,
  resave: false, saveUninitialized: false,
  cookie: { secure: true, maxAge: 24 * 60 * 60 * 1000 }
}));
"""),
]

story += [
    Q(125, "How do you handle WebSockets with Node.js (Socket.io)?"),
    body_p("Already covered in Q110 with detailed chat example. Additional Socket.io patterns: namespaces (logical separation within one server), rooms (dynamic groups), acknowledgements (confirmed delivery), and broadcasting strategies."),
    code("""
const io = require('socket.io')(server);

// ── Namespaces — logical separation ───────────────────────────
const chatNs  = io.of('/chat');
const gameNs  = io.of('/game');
const adminNs = io.of('/admin');

adminNs.use((socket, next) => {   // middleware per namespace
  if (socket.user?.role !== 'admin') return next(new Error('Forbidden'));
  next();
});

// ── Rooms — dynamic grouping ───────────────────────────────────
socket.join('room:123');
socket.leave('room:123');
io.to('room:123').emit('event', data);     // everyone in room
socket.to('room:123').emit('event', data); // everyone EXCEPT sender
io.except('room:123').emit('event', data); // everyone NOT in room

// ── Acknowledgements — confirmed delivery ─────────────────────
// Client:
socket.emit('message', { text: 'Hello' }, (ack) => {
  console.log('Server received:', ack.status);
});

// Server:
socket.on('message', (data, ack) => {
  saveMessage(data);
  ack({ status: 'ok', id: savedMessage._id });
});

// ── Volatile events (drop if client disconnected) ─────────────
socket.volatile.emit('cursor-position', { x: 100, y: 200 });

// ── Broadcasting patterns ──────────────────────────────────────
io.emit('announcement', data);               // all connected clients
socket.broadcast.emit('event', data);        // all EXCEPT this socket
io.to(['room1', 'room2']).emit('e', data);   // multiple rooms
io.to(socketId).emit('private-msg', data);   // specific socket
"""),
]

story += [
    Q(127, "What is GraphQL and how does it compare to REST?"),
    body_p("GraphQL is a query language for APIs and a server-side runtime. Instead of multiple REST endpoints, you have a single /graphql endpoint where clients specify exactly what data they need in their query. This eliminates over-fetching (getting too much data) and under-fetching (needing multiple requests). It has a strongly typed schema that serves as a contract between client and server."),
    code("""
// ── REST vs GraphQL comparison ────────────────────────────────
// REST: to get user + their posts + post authors:
// GET /users/123
// GET /users/123/posts
// GET /users/456 (for each post's author)
// = 3+ requests, lots of extra data

// GraphQL: one request, exactly the data you need:
const query = `
  query GetUserWithPosts($userId: ID!) {
    user(id: $userId) {
      name
      email
      posts {
        title
        createdAt
        author { name }
      }
    }
  }
`;

// ── Apollo Server setup (Node.js) ────────────────────────────
const { ApolloServer, gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
  }
  type Query {
    user(id: ID!): User
    posts(limit: Int, cursor: String): PostConnection!
  }
  type Mutation {
    createPost(title: String!, content: String!): Post!
  }
  type PostConnection {
    edges: [Post!]!
    nextCursor: String
    hasNext: Boolean!
  }
`;

const resolvers = {
  Query: {
    user:  (_, { id }) => User.findById(id),
    posts: (_, { limit = 10, cursor }) => getPaginatedPosts(limit, cursor),
  },
  Mutation: {
    createPost: (_, { title, content }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      return Post.create({ title, content, authorId: user.id });
    }
  },
  User: {
    posts: (parent) => Post.find({ authorId: parent.id })
  },
  Post: {
    // DataLoader solves N+1 problem for author lookups
    author: (parent, _, { userLoader }) => userLoader.load(parent.authorId)
  }
};
"""),
]

story += [
    Q(129, "How do you monitor and log production Node.js applications?"),
    body_p("Production monitoring combines structured logging (Winston), error tracking (Sentry), performance monitoring (APM tools), and health check endpoints. The goal is to detect issues before users do and have enough context to diagnose them quickly."),
    code("""
// ── Winston structured logging ────────────────────────────────
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()           // JSON for log aggregators
      : winston.format.prettyPrint()    // readable in dev
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// ── Request ID for tracing across services ────────────────────
const { v4: uuidv4 } = require('uuid');
app.use((req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// ── Request logging middleware ────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP Request', {
      requestId: req.requestId,
      method:    req.method,
      url:       req.originalUrl,
      status:    res.statusCode,
      duration:  `${Date.now() - start}ms`,
      ip:        req.ip,
      userId:    req.user?.id,
    });
  });
  next();
});

// ── Sentry error tracking ─────────────────────────────────────
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });
app.use(Sentry.Handlers.requestHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());

// ── Health check endpoint ─────────────────────────────────────
app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([
    mongoose.connection.db.admin().ping(),
    redis.ping()
  ]);
  const [db, cache] = checks;
  const healthy = checks.every(c => c.status === 'fulfilled');
  res.status(healthy ? 200 : 503).json({
    status:  healthy ? 'healthy' : 'degraded',
    db:      db.status === 'fulfilled' ? 'ok' : 'down',
    cache:   cache.status === 'fulfilled' ? 'ok' : 'down',
    uptime:  process.uptime(),
    memory:  process.memoryUsage().heapUsed
  });
});
"""),
]

# ── ROUND 4 ──────────────────────────────────────────────────────────────
story += section("ROUND 4 — Manager / Delivery Head Round  (Q130–Q148)")

story += [
    Q(130, "How did you deploy your project to the cloud? (AWS ECS + CI/CD)"),
    body_p("A typical MERN production deployment uses AWS ECS (Fargate) for containerized Node.js API, S3 + CloudFront for the React SPA, MongoDB Atlas for managed database, and GitHub Actions for CI/CD. The pipeline builds Docker images, runs tests, and deploys on merge to main."),
    code("""
# ── Dockerfile for Node.js API ────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM base AS production
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]

# ── GitHub Actions CI/CD ──────────────────────────────────────
# .github/workflows/deploy.yml

name: Deploy to AWS ECS

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        run: |
          docker build -t my-api .
          docker tag my-api:latest $ECR_REGISTRY/my-api:$GITHUB_SHA
          docker push $ECR_REGISTRY/my-api:$GITHUB_SHA

      - name: Deploy to ECS (rolling update)
        run: |
          aws ecs update-service \\
            --cluster production \\
            --service api-service \\
            --force-new-deployment
"""),
]

story += [
    Q(133, "How do you ensure code quality in your projects?"),
    body_p("Code quality is enforced through automated tooling (linting, formatting, testing) and process (code reviews, PR checks). The goal is to catch issues early and keep the codebase consistent, regardless of who wrote the code."),
    code("""
// ── ESLint + Prettier setup ───────────────────────────────────
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:node/recommended',
            'plugin:security/recommended', 'prettier'],
  plugins: ['security'],
  rules: {
    'no-unused-vars':      'error',
    'no-console':          ['warn', { allow: ['error', 'warn'] }],
    'prefer-const':        'error',
    'security/detect-sql-injection': 'error',
  }
};

// .prettierrc
{ "semi": true, "singleQuote": true, "printWidth": 100, "trailingComma": "es5" }

// ── Husky + lint-staged (pre-commit hooks) ────────────────────
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit":  "lint-staged",
      "commit-msg":  "commitlint --edit $1",
      "pre-push":    "npm test"
    }
  },
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}

// ── Jest test coverage enforcement ────────────────────────────
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches:   70,
      functions:  80,
      lines:      80,
      statements: 80
    }
  }
};

// ── Code review checklist (in PR template) ────────────────────
// - [ ] Tests added/updated for new functionality
// - [ ] No hardcoded secrets or credentials
// - [ ] Error handling for all async operations
// - [ ] Input validation on all API endpoints
// - [ ] No n+1 queries (check with explain())
// - [ ] Breaking changes documented
"""),
]

story += [
    Q(134, "What is your approach to writing unit tests? (Jest, Mocha, Chai)"),
    body_p("Unit testing verifies individual functions/modules in isolation. The AAA pattern (Arrange, Act, Assert) structures each test clearly. Mock external dependencies (databases, APIs, email) to keep tests fast and deterministic. Integration tests test the full HTTP layer with a real database (using a test DB or MongoDB memory server)."),
    code("""
// ── Unit test: service function ───────────────────────────────
// services/userService.test.js
const userService = require('./userService');
const User        = require('../models/User');

jest.mock('../models/User');  // mock the Mongoose model

describe('UserService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const mockUser = { _id: '123', name: 'Alice', email: 'a@b.com' };
      User.findById.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById('123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      User.findById.mockResolvedValue(null);

      await expect(userService.getUserById('999'))
        .rejects.toThrow('User not found');
    });
  });
});

// ── Integration test: API endpoint ────────────────────────────
const request   = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('POST /api/auth/login', () => {
  let mongoServer;
  let app;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = require('../app');
    // Seed test user
    await User.create({ email: 'test@example.com', password: await bcrypt.hash('pass123', 12) });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('should return tokens on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should return 401 on invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });
});
"""),
]

story += [
    Q(135, "How do you handle technical debt?"),
    body_p("Technical debt is code that is quick to write but costly to maintain. It accumulates when teams take shortcuts under time pressure. The key is to make it visible, track it, and allocate regular time to address it — rather than ignoring it until it becomes a crisis."),
    body_p("Strategies: 1) Track debt in your issue tracker with a 'tech-debt' label. 2) Dedicate 20% of each sprint to debt reduction. 3) Use the Boy Scout Rule — leave code better than you found it. 4) Set quality gates (coverage thresholds, lint rules) to prevent new debt. 5) Refactor incrementally with tests as a safety net — never rewrite everything at once."),
    code("""
// ── Identifying debt: code smells to look for ─────────────────
// 1. Long functions (> 30 lines) — extract into smaller functions
// 2. Deeply nested code — extract conditions into early returns
// 3. Magic numbers/strings — extract into named constants
// 4. Duplicated logic — extract into shared utility

// BAD — deeply nested, hard to read
function processOrder(order) {
  if (order) {
    if (order.items && order.items.length > 0) {
      if (order.user && order.user.isActive) {
        if (order.total > 0) {
          // actual logic buried here
        }
      }
    }
  }
}

// GOOD — guard clauses (early returns), each condition clear
function processOrder(order) {
  if (!order) throw new Error('Order required');
  if (!order.items?.length) throw new ValidationError('Order has no items');
  if (!order.user?.isActive) throw new ValidationError('User not active');
  if (order.total <= 0) throw new ValidationError('Order total must be positive');
  // actual logic at the top level — easy to read
  return calculateShipping(order);
}

// ── Incremental refactoring with tests ───────────────────────
// Step 1: Write tests for existing behaviour (characterisation tests)
// Step 2: Refactor with confidence — tests catch regressions
// Step 3: Improve one thing at a time — never "rewrite everything"
"""),
]

# HR round
story += section("ROUND 5 — HR Round  (Q149–Q153)")

story += [
    Q(149, "What are your salary expectations?"),
    body_p("Research market rates for your role, experience level, and location on Glassdoor, LinkedIn Salary, and Levels.fyi. For mid-level MERN/MEAN developers in India (2026), the range is approximately ₹12–25 LPA depending on company and city. For senior roles, ₹25–45 LPA. Anchor your expectations 15–20% above your actual minimum."),
    body_p("Sample answer: 'Based on my research for this role and my [X] years of experience with the MERN stack — including [specific skills: microservices, AWS, etc.] — I'm looking at [range]. That said, I'm flexible based on the total compensation package including benefits, learning opportunities, and growth potential. What is the budgeted range for this position?'"),
    body_p("Tips: Always give a range, not a single number. Ask for their range to let them anchor first. Factor in the full package (equity, bonuses, WFH flexibility). Never share your current salary unless legally required."),
]

story += [
    Q(151, "How soon can you join?"),
    body_p("Be honest about your notice period. Most Indian IT companies have a 30–90 day notice period. Negotiate if possible. If you can join sooner (buyout option), mention it as a possibility, not a guarantee."),
    body_p("Sample answer: 'My current notice period is 60 days. I'll start the relieving process as soon as I receive the offer letter. Depending on project handover, I may be able to buy out a portion of my notice — my employer permits this. I'd target joining within [45-60] days. Would that timeline work for this role?'"),
    body_p("If you're a fresher or currently unemployed: 'I can join immediately / within 2 weeks, which gives me time to relocate and complete any joining formalities.'"),
]

story += [
    Q(153, "What motivates you as a developer?"),
    body_p("Be genuine. Interviewers can spot a generic answer. Connect your motivation to something specific about the role or company. Common authentic motivations: solving real problems, learning new technologies, seeing users use what you built, code quality craftsmanship, mentoring others."),
    body_p("Sample answer: 'I'm most motivated when I can see the direct impact of my work on real users. In my last project, I rebuilt the search feature using Elasticsearch and MongoDB text indexes — query time dropped from 2 seconds to 80ms. Watching that improvement in production and reading user feedback was incredibly satisfying. At Accion Labs, I'm excited about the opportunity to work on scalable enterprise products where my architectural decisions affect thousands of users. I also enjoy the technical depth of the MERN ecosystem — the JavaScript all-the-way-down approach means I can contribute across the stack and own features end-to-end, which keeps me engaged.'"),
]

# ── BONUS ─────────────────────────────────────────────────────────────────
story += section("BONUS — Advanced / Frequently Missed Topics  (Q154–Q163)")

story += [
    Q(154, "What is the difference between authentication and authorization?"),
    body_p("Authentication (AuthN) is the process of verifying WHO you are — proving your identity. 'Are you really Alice?' Authorization (AuthZ) is determining what you are ALLOWED to do — checking your permissions after identity is confirmed. 'Alice is authenticated, but can she access /admin?'"),
    code("""
// ── Authentication — verifying identity ───────────────────────
async function authenticate(email, password) {
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new Error('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Wrong password');

  // Authentication succeeded — issue identity token
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
}

// ── Authorization — checking permissions ──────────────────────
// Simple role-based:
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

app.delete('/api/users/:id', requireAuth, requireRole('admin'), deleteUser);

// ── RBAC (Role-Based Access Control) ─────────────────────────
const permissions = {
  admin:     ['users:read', 'users:write', 'users:delete', 'reports:read'],
  moderator: ['users:read', 'posts:write', 'posts:delete'],
  user:      ['users:read', 'posts:read'],
};

const can = (permission) => (req, res, next) => {
  const userPerms = permissions[req.user.role] || [];
  if (!userPerms.includes(permission))
    return res.status(403).json({ error: `Missing permission: ${permission}` });
  next();
};

app.get('/api/reports', requireAuth, can('reports:read'), getReports);
app.delete('/api/users/:id', requireAuth, can('users:delete'), deleteUser);

// ── ABAC (Attribute-Based) — resource ownership check ─────────
const canEditPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (String(post.authorId) !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not your post' });
  req.post = post;
  next();
};
"""),
]

story += [
    Q(155, "Explain SOLID principles with JavaScript examples"),
    body_p("SOLID is a set of five object-oriented design principles that help create maintainable, extensible, and testable code. Originally formulated by Robert C. Martin for class-based OOP, they apply equally well to JavaScript modules and functions."),
    code("""
// ── S: Single Responsibility Principle ───────────────────────
// Each class/function does ONE thing

// BAD:
class UserManager {
  saveUser(user) { /* DB logic */ }
  sendWelcomeEmail(user) { /* Email logic */ }
  generateReport(users) { /* Report logic */ }
}

// GOOD: separate concerns
class UserRepository { save(user) { /* DB */ } }
class EmailService    { sendWelcome(user) { /* Email */ } }
class ReportGenerator { generate(users) { /* Report */ } }

// ── O: Open/Closed Principle ──────────────────────────────────
// Open for extension, closed for modification

// BAD: add new shape = modify existing code
function getArea(shape) {
  if (shape.type === 'circle')    return Math.PI * shape.r ** 2;
  if (shape.type === 'rectangle') return shape.w * shape.h;
  // must edit this function for every new shape
}

// GOOD: extend by adding new classes
class Circle    { area() { return Math.PI * this.r ** 2; } }
class Rectangle { area() { return this.w * this.h; } }
class Triangle  { area() { return 0.5 * this.b * this.h; } }  // no modification
function totalArea(shapes) { return shapes.reduce((sum, s) => sum + s.area(), 0); }

// ── L: Liskov Substitution Principle ─────────────────────────
// Subtypes must be substitutable for their base types

class Bird { fly() { return 'flying'; } }
// BAD: Penguin extends Bird but can't fly — violates LSP
class Penguin extends Bird { fly() { throw new Error('cannot fly!'); } }

// GOOD: separate capability interfaces
class FlyingBird { fly() {} }
class SwimmingBird { swim() {} }
class Eagle extends FlyingBird { fly() { return 'soaring'; } }
class Penguin2 extends SwimmingBird { swim() { return 'swimming'; } }

// ── I: Interface Segregation ──────────────────────────────────
// Don't force classes to implement methods they don't need
// In JS: use separate mixins / composition

const Serializable = {
  serialize()   { return JSON.stringify(this); },
  deserialize() { /* ... */ }
};
const Printable = {
  print() { console.log(this.toString()); }
};
// Mix in only what's needed:
class Document { }
Object.assign(Document.prototype, Serializable);  // but not Printable

// ── D: Dependency Inversion ───────────────────────────────────
// Depend on abstractions, not concrete implementations

// BAD: UserService hard-codes MySQL
class UserService {
  constructor() { this.db = new MySQLDatabase(); }  // concrete
}

// GOOD: inject any database
class UserService2 {
  constructor(db) { this.db = db; }  // abstraction (anything with .findById etc.)
  async getUser(id) { return this.db.findById(id); }
}
const svc = new UserService2(new MongoDatabase());  // or new MockDatabase() in tests
"""),
]

story += [
    Q(156, "What is tree-shaking in webpack?"),
    body_p("Tree-shaking is a dead-code elimination technique used by bundlers (webpack, Rollup, Vite) to remove unused exports from the final bundle. It works by statically analysing ES Module import/export statements (which are static and analysable at build time — unlike CommonJS require). The name comes from 'shaking the tree and watching dead leaves fall'."),
    code("""
// ── math.js — utility module ──────────────────────────────────
export const add      = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export const divide   = (a, b) => a / b;

// ── app.js — only imports add ─────────────────────────────────
import { add } from './math.js';
console.log(add(2, 3));
// Tree-shaking removes subtract, multiply, divide from the bundle

// ── Requirements for tree-shaking to work ─────────────────────
// 1. ES Modules (import/export) — NOT require()
// 2. No side effects in modules (or mark them in package.json)
// 3. Production mode in webpack (sets optimization.usedExports: true)

// package.json — tell webpack this package has no side effects
{
  "sideEffects": false,        // mark entire package as tree-shakeable
  // or list files that DO have side effects:
  "sideEffects": ["./src/polyfills.js", "*.css"]
}

// webpack.config.js
module.exports = {
  mode: 'production',          // enables tree-shaking + minification
  optimization: {
    usedExports: true,         // mark unused exports
    minimize:    true,         // remove them
  }
};

// ── Lodash — common tree-shaking gotcha ───────────────────────
// BAD — imports entire lodash library (~72KB)
import _ from 'lodash';
_.debounce(fn, 300);

// GOOD — imports only debounce (~2KB)
import debounce from 'lodash/debounce';
// Or use lodash-es (ES module version — fully tree-shakeable):
import { debounce } from 'lodash-es';
"""),
]

story += [
    Q(157, "What is the difference between localStorage, sessionStorage, and cookies?"),
    body_p("All three store data in the browser, but differ in capacity, persistence, scope, and server accessibility. localStorage persists until explicitly cleared. sessionStorage clears when the browser tab is closed. Cookies are sent to the server on every request and can be set server-side with HttpOnly for security."),
    code("""
// ── localStorage ──────────────────────────────────────────────
// Capacity: ~5MB | Persists: Until cleared | Server: Never
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');     // 'dark'
localStorage.removeItem('theme');
localStorage.clear();

// Store objects (must serialize):
localStorage.setItem('user', JSON.stringify({ name: 'Alice' }));
const user = JSON.parse(localStorage.getItem('user'));

// ── sessionStorage ────────────────────────────────────────────
// Capacity: ~5MB | Persists: Until tab close | Server: Never
sessionStorage.setItem('wizard-step', '3');      // form wizard state
// Cleared when tab/window closes — good for sensitive temp data

// ── Cookies ───────────────────────────────────────────────────
// Capacity: ~4KB | Persists: Until expiry | Server: Sent with EVERY request

// Client-side (accessible to JS):
document.cookie = 'language=en; path=/; max-age=86400';

// Server-side (httpOnly — CANNOT be read by JS — XSS protection):
res.cookie('accessToken', token, {
  httpOnly: true,       // JS cannot access — prevents XSS token theft
  secure:   true,       // HTTPS only
  sameSite: 'strict',   // CSRF protection (not sent with cross-site requests)
  maxAge:   900000,     // 15 minutes
  path:     '/'
});

// ── Decision guide ────────────────────────────────────────────
// Auth tokens (JWT):     httpOnly cookie (most secure)
// User preferences:      localStorage (persist across sessions)
// Shopping cart (local): localStorage
// Multi-step form state: sessionStorage (clear on tab close)
// API session cookie:    httpOnly cookie with sameSite

// ── Security note ─────────────────────────────────────────────
// NEVER store auth tokens in localStorage — XSS can steal them
// Use httpOnly cookies OR in-memory state (React useState) instead
"""),
]

story += [
    Q(158, "What are Web Workers?"),
    body_p("Web Workers run JavaScript in a background thread, separate from the main UI thread. Since JavaScript is single-threaded, heavy computations block rendering and make the UI unresponsive. Web Workers solve this by offloading CPU-intensive work. Workers cannot access the DOM — they communicate with the main thread via message passing."),
    code("""
// ── main.js (UI thread) ───────────────────────────────────────
const worker = new Worker('./worker.js');

// Send data to worker
worker.postMessage({ type: 'sort', data: hugeArray });

// Receive result
worker.onmessage = (event) => {
  if (event.data.type === 'sorted') {
    renderList(event.data.result);  // UI update back on main thread
  }
};

worker.onerror = (err) => console.error('Worker error:', err);

// ── worker.js (background thread) ────────────────────────────
self.onmessage = (event) => {
  const { type, data } = event.data;

  if (type === 'sort') {
    // This heavy computation no longer blocks the UI
    const sorted = data.sort((a, b) => a - b);
    self.postMessage({ type: 'sorted', result: sorted });
  }
};

// ── React example: offload data processing ────────────────────
import { useEffect, useRef, useState } from 'react';

function DataTable({ rawData }) {
  const [processed, setProcessed] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./dataWorker.js', import.meta.url));
    workerRef.current.onmessage = (e) => setProcessed(e.data);
    return () => workerRef.current.terminate();
  }, []);

  useEffect(() => {
    if (rawData) workerRef.current.postMessage(rawData);
  }, [rawData]);

  if (!processed) return <Spinner />;
  return <table>{/* render processed */}</table>;
}

// ── SharedArrayBuffer for shared memory between workers ────────
const sharedBuffer = new SharedArrayBuffer(1024);
const sharedArray  = new Int32Array(sharedBuffer);
worker.postMessage({ buffer: sharedBuffer });
// Worker can read/write to same memory — use Atomics for thread safety
Atomics.add(sharedArray, 0, 1);  // atomic increment
"""),
]

story += [
    Q(159, "How does HTTPS work? (TLS handshake)"),
    body_p("HTTPS is HTTP over TLS (Transport Layer Security). TLS provides: encryption (data can't be read in transit), authentication (server's identity is verified via certificate), integrity (data can't be tampered with). The TLS handshake establishes a secure session before any HTTP data is sent."),
    body_p("TLS 1.3 Handshake (simplified): 1) Client Hello: client sends supported TLS versions, cipher suites, and a random value. 2) Server Hello: server responds with chosen cipher suite, its digital certificate, and its public key. 3) Client verifies the certificate against trusted CAs. 4) Key exchange (ECDHE): both sides generate a shared session key without transmitting it. 5) Both sides send Finished message encrypted with the session key. 6) Encrypted HTTP communication begins."),
    code("""
// ── HTTPS in Node.js ──────────────────────────────────────────
const https   = require('https');
const fs      = require('fs');
const express = require('express');
const app     = express();

// Self-signed certificate (development only):
const options = {
  key:  fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
  // CA bundle for Let's Encrypt / paid SSL:
  // ca: fs.readFileSync('./certs/ca.crt')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server on port 443');
});

// ── Redirect HTTP to HTTPS ────────────────────────────────────
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80);

// ── Security headers (Helmet.js) ──────────────────────────────
const helmet = require('helmet');
app.use(helmet());
// Sets:
// Strict-Transport-Security: max-age=31536000  (HSTS — always use HTTPS)
// X-Content-Type-Options: nosniff
// X-Frame-Options: SAMEORIGIN
// Content-Security-Policy: (see Q161)
// Referrer-Policy: no-referrer

// ── Let's Encrypt free SSL (production) ───────────────────────
// Use certbot on your server:
// sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
// Auto-renews every 90 days

// ── AWS/Nginx TLS termination (common pattern) ────────────────
// Client <-> AWS ALB (HTTPS/TLS) <-> EC2/ECS (HTTP internally)
// The load balancer handles TLS — Node.js only deals with HTTP inside the VPC
"""),
]

story += [
    Q(160, "What is the same-origin policy?"),
    body_p("The same-origin policy is a browser security rule that prevents a web page from making requests to a different origin than the one that served it. Origin = protocol + domain + port. Two URLs have the same origin only if ALL THREE match. This prevents malicious sites from reading your bank's data using your session cookies."),
    code("""
// ── Same origin examples ──────────────────────────────────────
// Page at: https://myapp.com/page

// https://myapp.com/api/data          SAME ORIGIN  (same protocol, domain, port)
// http://myapp.com/api/data           DIFFERENT    (http vs https)
// https://api.myapp.com/data          DIFFERENT    (different subdomain)
// https://myapp.com:8080/data         DIFFERENT    (different port)
// https://otherapp.com/data           DIFFERENT    (different domain)

// ── What SOP blocks ───────────────────────────────────────────
// 1. Fetch/XHR to different origin (blocked unless CORS headers present)
// 2. Reading response from cross-origin iframe
// 3. Reading cookies from different origin

// ── What SOP allows ───────────────────────────────────────────
// 1. Loading scripts/images/CSS from other origins (<img>, <script src>)
// 2. Embedding iframes (but can't read their content)
// 3. Form submissions to other origins (but can't read response)

// ── CORS relaxes SOP for legitimate cross-origin requests ──────
// Server signals: "I allow requests from these origins"
// Access-Control-Allow-Origin: https://myapp.com

// ── postMessage for cross-origin iframes ─────────────────────
// Parent page (https://myapp.com):
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({ type: 'data', value: 42 }, 'https://widget.com');

// iframe (https://widget.com):
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://myapp.com') return;  // ALWAYS validate origin!
  console.log('Received:', event.data);
});
"""),
]

story += [
    Q(161, "Explain CSP (Content Security Policy)"),
    body_p("Content Security Policy is an HTTP header that tells the browser which sources of content (scripts, styles, images, fonts, etc.) are trusted. It is the primary defence against XSS (Cross-Site Scripting) attacks — even if an attacker injects a script tag, the browser won't execute it if the source isn't whitelisted."),
    code("""
// ── Setting CSP header with Helmet.js ─────────────────────────
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],                    // all content from same origin by default
    scriptSrc:  ["'self'", 'cdn.example.com',
                 "'nonce-{RANDOM}'"],           // allow specific CDN + nonce
    styleSrc:   ["'self'", "'unsafe-inline'",   // inline styles (needed for some libs)
                 'fonts.googleapis.com'],
    fontSrc:    ["'self'", 'fonts.gstatic.com'],
    imgSrc:     ["'self'", 'data:', 'cdn.example.com', '*.amazonaws.com'],
    connectSrc: ["'self'", 'api.example.com',   // fetch/XHR destinations
                 'wss://realtime.example.com'],  // WebSocket
    frameSrc:   ["'none'"],                      // no iframes allowed
    objectSrc:  ["'none'"],                      // no plugins
    upgradeInsecureRequests: [],                 // auto-upgrade http to https
  }
}));

// ── Nonce-based CSP (for inline scripts) ──────────────────────
import crypto from 'crypto';

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
  }
}));

// In template (the nonce allows this specific script):
// <script nonce="<%= nonce %>">
//   const data = { userId: '<%= userId %>' };
// </script>

// ── CSP Report-Only (test before enforcing) ────────────────────
// Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body);  // log to Sentry or dashboard
  res.status(204).end();
});
"""),
]

story += [
    Q(162, "What is the difference between npm, yarn, and pnpm?"),
    body_p("All three are JavaScript package managers that install and manage dependencies from the npm registry. They differ in performance, disk usage, and how they handle the node_modules structure."),
    code("""
// ── npm (Node Package Manager) ────────────────────────────────
// - Default, ships with Node.js
// - npm 7+ introduced workspaces for monorepos
// - npm ci for clean installs in CI/CD (uses package-lock.json exactly)
// - Hoists all dependencies to root node_modules (can cause phantom deps)

npm install          // install all deps
npm install express  // add dependency
npm ci               // clean install (CI use) — faster, exact lock
npm audit            // security check
npm run build        // run script

// ── Yarn (by Facebook) ────────────────────────────────────────
// - Faster than original npm (parallel installs, better caching)
// - yarn.lock file for deterministic installs
// - Yarn Berry (v2+) uses Plug'n'Play — no node_modules at all!
//   (files stored in a zip cache, imported directly)

yarn install
yarn add express
yarn dlx create-react-app myapp   // npx equivalent
yarn workspaces foreach run build  // monorepo

// ── pnpm (Performant npm) ─────────────────────────────────────
// - Uses hard links — packages stored ONCE in a global content-store
// - node_modules references (symlinks) to the store
// - Saves massive disk space for multiple projects
// - Strict by default — no phantom dependencies (can't use undeclared packages)
// - Fastest of the three for most operations

pnpm install
pnpm add express
pnpm -r run build    // run in all workspace packages

// ── Comparison table ──────────────────────────────────────────
// | Feature           | npm    | yarn   | pnpm   |
// |-------------------|--------|--------|--------|
// | Speed             | medium | fast   | fast   |
// | Disk space        | high   | high   | low    |
// | Phantom deps      | yes    | yes    | no     |
// | Monorepo support  | yes    | yes    | yes    |
// | Zero installs     | no     | yes    | no     |
// | Default with Node | yes    | no     | no     |
"""),
]

story += [
    Q(163, "What are monorepos and tools like Nx/Turborepo?"),
    body_p("A monorepo is a single repository containing multiple related projects (apps, packages, services). Benefits: code sharing between projects, atomic commits across projects, single CI/CD pipeline, consistent tooling. The challenge is build performance — you don't want to rebuild everything when you change one package. Nx and Turborepo solve this with dependency graph analysis and intelligent caching."),
    code("""
// ── Monorepo structure ────────────────────────────────────────
// packages/
//   ui-components/     (shared React component library)
//   utils/             (shared utility functions)
//   api-client/        (shared API client types)
// apps/
//   web/               (customer-facing Next.js app)
//   admin/             (admin React app)
//   api/               (Node.js Express API)
// package.json         (root — workspaces config)

// ── pnpm workspaces setup ─────────────────────────────────────
// pnpm-workspace.yaml:
// packages:
//   - 'apps/*'
//   - 'packages/*'

// packages/ui-components/package.json:
{ "name": "@myorg/ui-components", "version": "1.0.0" }

// apps/web/package.json:
{
  "dependencies": {
    "@myorg/ui-components": "workspace:*",  // local reference
    "@myorg/utils":          "workspace:*"
  }
}

// ── Turborepo (minimal, fast, by Vercel) ──────────────────────
// turbo.json:
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // build deps first
      "outputs":   [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs":   ["coverage/**"]
    },
    "lint": {}
  }
}

// Commands:
// turbo build          — build all (parallel, respects dependencies)
// turbo build --filter=web  — build only web + its deps
// turbo build --force  — skip cache

// ── Nx (more opinionated, great for enterprise) ───────────────
// nx build web           — build web app
// nx affected --target=test  — test ONLY changed projects + dependents
// nx graph               — visualize dependency graph in browser
// nx generate @nrwl/react:app new-app  — generate new app from template

// ── Cache: the superpower ─────────────────────────────────────
// If you change only packages/ui-components:
// - packages/utils        — NOT rebuilt (cache hit)
// - packages/ui-components — rebuilt (changed)
// - apps/web              — rebuilt (depends on ui-components)
// - apps/admin            — rebuilt (depends on ui-components)
// - apps/api              — NOT rebuilt (doesn't depend on ui-components)
"""),
]

# ── CLOSING SUMMARY ──────────────────────────────────────────────────────
story += section("Quick Reference Summary")

story += [
    Paragraph("Key Concepts at a Glance", topic_h),
    body_p("JavaScript: Closures remember outer scope. Hoisting: var=undefined, let/const=TDZ. Event loop: microtasks before macrotasks. Arrow functions: lexical 'this'. Promises: single async value; Observables: stream."),
    body_p("React: VDOM diffs before touching real DOM. Fiber makes reconciliation interruptible. Hooks replace class lifecycle methods. useMemo = memoize value, useCallback = memoize function, useRef = mutable without re-render."),
    body_p("Angular: Two-way binding via [(ngModel)]. DI system injects services. OnPush skips change detection unless input ref changes. RxJS Observables are lazy and cancellable. BehaviorSubject = current state."),
    body_p("Node.js: Single thread + event loop + libuv thread pool. Never block the event loop with sync operations. Use async/await, streams for large data, cluster/PM2 for multi-core utilization."),
    body_p("MongoDB: Documents are BSON objects. COLLSCAN = no index (slow). ESR rule for compound indexes. Aggregation pipeline for analytics. Transactions for multi-document atomicity."),
    body_p("Security: Authentication = who you are. Authorization = what you can do. JWT in httpOnly cookies. CSP prevents XSS. CORS controls cross-origin requests. Helmet adds security headers."),
    body_p("Performance: Redis cache = O(1) vs DB = O(log n). Code splitting + lazy loading = smaller bundles. Cursor pagination > offset pagination at scale. EXPLAIN queries to check index usage."),
    Spacer(1, 0.5*cm),
    Paragraph("Good luck at Accion Labs! — MERN/MEAN Interview Guide 2026", cover_note),
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
print(f"PDF generated: {OUTPUT}")