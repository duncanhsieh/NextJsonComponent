'use strict';

var React = require('react');
var zustand = require('zustand');
var hash = require('object-hash');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);
var hash__default = /*#__PURE__*/_interopDefault(hash);

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
function createScopedStore(initialState = {}) {
  return zustand.create((set, get) => __spreadProps(__spreadValues({}, initialState), {
    setState: ((update) => {
      set((current) => {
        const partial = typeof update === "function" ? update(current) : update;
        return __spreadValues(__spreadValues({}, current), partial);
      });
    }),
    // Expose getState for use in action handlers
    getState: () => get()
  }));
}

// src/lib/next-json-component/static-analyzer.ts
var EXPR_RE = /\{\{[\s\S]+?\}\}/;
function hasExpression(value) {
  return EXPR_RE.test(value);
}
function isPropDynamic(value) {
  if (typeof value === "string") {
    return hasExpression(value);
  }
  if (typeof value === "object" && value !== null) {
    if ("action" in value && typeof value.action === "string") {
      return true;
    }
  }
  return false;
}
function hasAnyDynamicProp(props) {
  if (!props) return false;
  return Object.values(props).some(isPropDynamic);
}
function isChildDynamic(child) {
  if (typeof child === "string") {
    return hasExpression(child);
  }
  return false;
}
function analyzeNode(node) {
  var _a, _b, _c, _d;
  if (node.$if !== void 0 || node.$each !== void 0) {
    const analyzedChildren2 = (_b = (_a = node.children) == null ? void 0 : _a.map(analyzeChild)) != null ? _b : [];
    return __spreadProps(__spreadValues({}, node), {
      children: analyzedChildren2,
      isStatic: false
    });
  }
  const dynamicProps = hasAnyDynamicProp(node.props);
  const analyzedChildren = (_d = (_c = node.children) == null ? void 0 : _c.map(analyzeChild)) != null ? _d : [];
  const dynamicTextChild = analyzedChildren.some(
    (child) => typeof child === "string" && isChildDynamic(child)
  );
  const dynamicSubNode = analyzedChildren.some(
    (child) => typeof child !== "string" && !child.isStatic
  );
  const isStatic = !dynamicProps && !dynamicTextChild && !dynamicSubNode;
  return __spreadProps(__spreadValues({}, node), {
    children: analyzedChildren,
    isStatic
  });
}
function analyzeChild(child) {
  if (typeof child === "string") {
    return child;
  }
  return analyzeNode(child);
}
function analyzeTree(root) {
  return analyzeNode(root);
}

// src/lib/next-json-component/safe-evaluator.ts
var BLOCKED_IDENTIFIERS = /* @__PURE__ */ new Set([
  "window",
  "globalThis",
  "self",
  "global",
  "document",
  "localStorage",
  "sessionStorage",
  "location",
  "navigator",
  "alert",
  "confirm",
  "prompt",
  "eval",
  "Function",
  "XMLHttpRequest",
  "fetch",
  "WebSocket",
  "importScripts",
  "require",
  "process",
  "__proto__",
  "prototype",
  "constructor"
]);
var SafeEvalError = class extends Error {
  constructor(message) {
    super(`[SafeEvaluator] ${message}`);
    this.name = "SafeEvalError";
  }
};
function tokenize(expr) {
  var _a, _b, _c;
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    if (/\s/.test(expr[i])) {
      i++;
      continue;
    }
    if (/[0-9]/.test(expr[i]) || expr[i] === "-" && /[0-9]/.test((_a = expr[i + 1]) != null ? _a : "")) {
      let num = "";
      if (expr[i] === "-") {
        num += "-";
        i++;
      }
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i++];
      }
      tokens.push({ type: "NUMBER", value: num });
      continue;
    }
    if (expr[i] === "'" || expr[i] === '"') {
      const quote = expr[i++];
      let str = "";
      while (i < expr.length && expr[i] !== quote) {
        if (expr[i] === "\\") {
          i++;
          const escaped = {
            n: "\n",
            t: "	",
            r: "\r",
            "\\": "\\",
            "'": "'",
            '"': '"',
            "`": "`"
          };
          str += (_b = escaped[expr[i]]) != null ? _b : expr[i];
          i++;
        } else {
          str += expr[i++];
        }
      }
      i++;
      tokens.push({ type: "STRING", value: str });
      continue;
    }
    if (expr[i] === "`") {
      i++;
      const parts = [];
      let staticPart = "";
      while (i < expr.length && expr[i] !== "`") {
        if (expr[i] === "\\") {
          i++;
          const escaped = {
            n: "\n",
            t: "	",
            r: "\r",
            "\\": "\\",
            "`": "`",
            "$": "$"
          };
          staticPart += (_c = escaped[expr[i]]) != null ? _c : expr[i];
          i++;
        } else if (expr[i] === "$" && expr[i + 1] === "{") {
          parts.push(staticPart);
          staticPart = "";
          i += 2;
          let depth = 1;
          let inner = "";
          while (i < expr.length && depth > 0) {
            if (expr[i] === "{") depth++;
            else if (expr[i] === "}") {
              depth--;
              if (depth === 0) {
                i++;
                break;
              }
            }
            inner += expr[i++];
          }
          parts.push(inner);
        } else {
          staticPart += expr[i++];
        }
      }
      parts.push(staticPart);
      i++;
      tokens.push({ type: "TEMPLATE_LITERAL", value: JSON.stringify(parts) });
      continue;
    }
    const twoChar = expr.slice(i, i + 3);
    if (["===", "!=="].includes(twoChar)) {
      tokens.push({ type: "OP", value: twoChar });
      i += 3;
      continue;
    }
    const two = expr.slice(i, i + 2);
    if (["==", "!=", ">=", "<=", "&&", "||", "?."].includes(two)) {
      tokens.push({ type: two === "?." ? "OPTIONAL_DOT" : "OP", value: two });
      i += 2;
      continue;
    }
    const ch = expr[i];
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: ch });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ch });
      i++;
      continue;
    }
    if (ch === "[") {
      tokens.push({ type: "LBRACKET", value: ch });
      i++;
      continue;
    }
    if (ch === "]") {
      tokens.push({ type: "RBRACKET", value: ch });
      i++;
      continue;
    }
    if (ch === ".") {
      tokens.push({ type: "DOT", value: ch });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: ch });
      i++;
      continue;
    }
    if (ch === "?") {
      tokens.push({ type: "QUESTION", value: ch });
      i++;
      continue;
    }
    if (ch === ":") {
      tokens.push({ type: "COLON", value: ch });
      i++;
      continue;
    }
    if (["+", "-", "*", "/", "%", "!", ">", "<"].includes(ch)) {
      tokens.push({ type: "OP", value: ch });
      i++;
      continue;
    }
    if (/[a-zA-Z_$]/.test(ch)) {
      let ident = "";
      while (i < expr.length && /[a-zA-Z0-9_$]/.test(expr[i])) {
        ident += expr[i++];
      }
      tokens.push({ type: "IDENT", value: ident });
      continue;
    }
    throw new SafeEvalError(`Unexpected character: "${ch}" in expression: ${expr}`);
  }
  tokens.push({ type: "EOF", value: "" });
  return tokens;
}
var Parser = class _Parser {
  constructor(tokens) {
    this.pos = 0;
    this.tokens = tokens;
  }
  peek() {
    return this.tokens[this.pos];
  }
  consume() {
    return this.tokens[this.pos++];
  }
  expect(type) {
    const tok = this.consume();
    if (tok.type !== type) {
      throw new SafeEvalError(`Expected ${type} but got ${tok.type} ("${tok.value}")`);
    }
    return tok;
  }
  /** Entry point — parse a full expression. */
  parseExpression(context) {
    return this.parseTernary(context);
  }
  // ternary: logical ? logical : logical
  parseTernary(context) {
    const cond = this.parseLogicalOr(context);
    if (this.peek().type === "QUESTION") {
      this.consume();
      const consequent = this.parseTernary(context);
      this.expect("COLON");
      const alternate = this.parseTernary(context);
      return cond ? consequent : alternate;
    }
    return cond;
  }
  // ||
  parseLogicalOr(context) {
    let left = this.parseLogicalAnd(context);
    while (this.peek().type === "OP" && this.peek().value === "||") {
      this.consume();
      const right = this.parseLogicalAnd(context);
      left = left || right;
    }
    return left;
  }
  // &&
  parseLogicalAnd(context) {
    let left = this.parseEquality(context);
    while (this.peek().type === "OP" && this.peek().value === "&&") {
      this.consume();
      const right = this.parseEquality(context);
      left = left && right;
    }
    return left;
  }
  // === !== == !=
  parseEquality(context) {
    let left = this.parseComparison(context);
    while (this.peek().type === "OP" && ["===", "!==", "==", "!="].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseComparison(context);
      if (op === "===" || op === "==") left = left === right;
      else left = left !== right;
    }
    return left;
  }
  // > < >= <=
  parseComparison(context) {
    let left = this.parseAdditive(context);
    while (this.peek().type === "OP" && [">", "<", ">=", "<="].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseAdditive(context);
      if (op === ">") left = left > right;
      else if (op === "<") left = left < right;
      else if (op === ">=") left = left >= right;
      else left = left <= right;
    }
    return left;
  }
  // + -
  parseAdditive(context) {
    let left = this.parseMultiplicative(context);
    while (this.peek().type === "OP" && ["+", "-"].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseMultiplicative(context);
      if (op === "+") left = left + right;
      else left = left - right;
    }
    return left;
  }
  // * / %
  parseMultiplicative(context) {
    let left = this.parseUnary(context);
    while (this.peek().type === "OP" && ["*", "/", "%"].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseUnary(context);
      if (op === "*") left = left * right;
      else if (op === "/") left = left / right;
      else left = left % right;
    }
    return left;
  }
  // ! unary
  parseUnary(context) {
    if (this.peek().type === "OP" && this.peek().value === "!") {
      this.consume();
      return !this.parsePostfix(context);
    }
    if (this.peek().type === "OP" && this.peek().value === "-") {
      this.consume();
      return -this.parsePostfix(context);
    }
    return this.parsePostfix(context);
  }
  // member access, dynamic access, function calls
  parsePostfix(context) {
    let obj = this.parsePrimary(context);
    while (true) {
      const tok = this.peek();
      if (tok.type === "DOT" || tok.type === "OPTIONAL_DOT") {
        const isOptional = this.consume().type === "OPTIONAL_DOT";
        if (isOptional && (obj === null || obj === void 0)) {
          obj = void 0;
        }
        const prop = this.expect("IDENT").value;
        this.checkBlockedProp(prop);
        if (obj !== void 0 && obj !== null) {
          obj = obj == null ? void 0 : obj[prop];
        } else {
          obj = void 0;
        }
      } else if (this.peek().type === "LBRACKET") {
        this.consume();
        const key = this.parseExpression(context);
        this.expect("RBRACKET");
        this.checkBlockedProp(String(key));
        obj = obj == null ? void 0 : obj[String(key)];
      } else if (this.peek().type === "LPAREN") {
        this.consume();
        const args = [];
        while (this.peek().type !== "RPAREN" && this.peek().type !== "EOF") {
          args.push(this.parseExpression(context));
          if (this.peek().type === "COMMA") this.consume();
        }
        this.expect("RPAREN");
        if (typeof obj !== "function") {
          throw new SafeEvalError(`Attempted to call a non-function value.`);
        }
        obj = obj(...args);
      } else {
        break;
      }
    }
    return obj;
  }
  checkBlockedProp(prop) {
    if (BLOCKED_IDENTIFIERS.has(prop)) {
      throw new SafeEvalError(`Access to "${prop}" is not allowed.`);
    }
  }
  // literals, identifiers, grouping
  parsePrimary(context) {
    const tok = this.peek();
    if (tok.type === "NUMBER") {
      this.consume();
      return parseFloat(tok.value);
    }
    if (tok.type === "STRING") {
      this.consume();
      return tok.value;
    }
    if (tok.type === "TEMPLATE_LITERAL") {
      this.consume();
      const parts = JSON.parse(tok.value);
      let result = "";
      for (let pi = 0; pi < parts.length; pi++) {
        if (pi % 2 === 0) {
          result += parts[pi];
        } else {
          try {
            const innerTokens = tokenize(parts[pi].trim());
            const innerParser = new _Parser(innerTokens);
            const val = innerParser.parseExpression(context);
            result += val === null || val === void 0 ? "" : String(val);
          } catch (e) {
            result += "";
          }
        }
      }
      return result;
    }
    if (tok.type === "IDENT") {
      this.consume();
      if (tok.value === "true") return true;
      if (tok.value === "false") return false;
      if (tok.value === "null") return null;
      if (tok.value === "undefined") return void 0;
      if (BLOCKED_IDENTIFIERS.has(tok.value)) {
        throw new SafeEvalError(`Access to "${tok.value}" is not allowed.`);
      }
      return context[tok.value];
    }
    if (tok.type === "LPAREN") {
      this.consume();
      const val = this.parseExpression(context);
      this.expect("RPAREN");
      return val;
    }
    throw new SafeEvalError(`Unexpected token: ${tok.type} ("${tok.value}")`);
  }
};
function safeEval(expression, context) {
  const tokens = tokenize(expression.trim());
  const parser = new Parser(tokens);
  const result = parser.parseExpression(context);
  return result;
}

// src/lib/next-json-component/expression-resolver.ts
var EXPR_PATTERN = /\{\{\s*([\s\S]+?)\s*\}\}/g;
function buildEvalContext(ctx) {
  var _a;
  return __spreadValues({
    state: ctx.state,
    props: ctx.props,
    setState: ctx.setState
  }, (_a = ctx.loopVars) != null ? _a : {});
}
function resolveExpression(template, ctx) {
  const evalCtx = buildEvalContext(ctx);
  EXPR_PATTERN.lastIndex = 0;
  const matches = [...template.matchAll(EXPR_PATTERN)];
  if (matches.length === 0) {
    return template;
  }
  if (matches.length === 1 && matches[0][0] === template.trim()) {
    const expr = matches[0][1];
    return safelyEval(expr, evalCtx);
  }
  return template.replace(EXPR_PATTERN, (_, expr) => {
    const val = safelyEval(expr.trim(), evalCtx);
    return val != null ? String(val) : "";
  });
}
function safelyEval(expr, evalCtx) {
  try {
    return safeEval(expr, evalCtx);
  } catch (err) {
    if (err instanceof SafeEvalError) {
      console.warn(`[NextJsonComponent] Expression evaluation failed: ${err.message}`);
      return void 0;
    }
    throw err;
  }
}
function isActionBinding(value) {
  return typeof value === "object" && value !== null && "action" in value && typeof value.action === "string";
}

// src/lib/next-json-component/action-registry.ts
var UnregisteredActionError = class extends Error {
  constructor(name, available) {
    super(
      `[ActionRegistry] Action "${name}" is not registered. Available actions: [${available.join(", ")}]`
    );
    this.name = "UnregisteredActionError";
  }
};
function resolveArgs(args, ctx) {
  if (!args || args.length === 0) return [];
  return args.map((arg) => {
    if (typeof arg === "string") {
      return resolveExpression(arg, ctx);
    }
    return arg;
  });
}
function createBoundHandler(binding, registry, ctx) {
  return async (...eventArgs) => {
    const event = eventArgs[0];
    if (event && typeof event === "object" && "preventDefault" in event) {
      event.preventDefault();
    }
    const action = registry[binding.action];
    if (!action) {
      throw new UnregisteredActionError(binding.action, Object.keys(registry));
    }
    const resolvedArgs = resolveArgs(binding.args, ctx);
    try {
      await action(
        ctx.state,
        ctx.setState,
        ctx.props,
        ...resolvedArgs
      );
    } catch (err) {
      console.error(`[ActionRegistry] Error executing action "${binding.action}":`, err);
    }
  };
}
function createBoundServerActionHandler(actionName, serverAction, binding, ctx) {
  return async (...eventArgs) => {
    const event = eventArgs[0];
    if (event && typeof event === "object" && "preventDefault" in event) {
      event.preventDefault();
    }
    const resolvedArgs = resolveArgs(binding.args, ctx);
    try {
      await serverAction(...resolvedArgs);
    } catch (err) {
      console.error(`[ActionRegistry] Error executing server action "${actionName}":`, err);
    }
  };
}
function resolveHandler(binding, ctx) {
  const { actionRegistry, serverActions } = ctx.options;
  if (binding.serverAction && (serverActions == null ? void 0 : serverActions[binding.action])) {
    return createBoundServerActionHandler(
      binding.action,
      serverActions[binding.action],
      binding,
      ctx
    );
  }
  if (actionRegistry == null ? void 0 : actionRegistry[binding.action]) {
    return createBoundHandler(binding, actionRegistry, ctx);
  }
  console.warn(`[ActionRegistry] No handler found for action "${binding.action}".`);
  return void 0;
}
function generateKey(item, index, resolvedKey) {
  if (resolvedKey != null && resolvedKey !== "") {
    return String(resolvedKey);
  }
  try {
    return `item_${hashItem(item)}`;
  } catch (e) {
    console.warn(
      `[NextJsonComponent] Could not hash list item at index ${index}. Falling back to index key. Consider adding a $key to your $each node.`
    );
    return `__index_${index}`;
  }
}
function hashItem(item) {
  if (item === null || item === void 0) {
    return "null";
  }
  if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
    return String(item);
  }
  return hash__default.default(item, {
    algorithm: "md5",
    encoding: "hex"
  });
}

// src/lib/next-json-component/node-renderer.ts
function renderNode(node, ctx, key) {
  if (node.$if !== void 0) {
    const visible = resolveExpression(node.$if, ctx);
    if (!visible) return null;
  }
  if (node.$each !== void 0) {
    return renderEach(node, ctx);
  }
  return renderSingleNode(node, ctx, key);
}
function renderEach(node, ctx) {
  var _a, _b;
  const items = resolveExpression(node.$each, ctx);
  if (!Array.isArray(items)) {
    console.warn(
      `[NextJsonComponent] $each expression did not resolve to an array. Got: ${typeof items}. Expression: ${node.$each}`
    );
    return null;
  }
  const itemVar = (_a = node.$as) != null ? _a : "item";
  const indexVar = (_b = node.$indexAs) != null ? _b : "index";
  return items.map((item, index) => {
    var _a2;
    const loopCtx = __spreadProps(__spreadValues({}, ctx), {
      loopVars: __spreadProps(__spreadValues({}, (_a2 = ctx.loopVars) != null ? _a2 : {}), {
        [itemVar]: item,
        [indexVar]: index
      })
    });
    let resolvedKey = void 0;
    if (node.$key) {
      resolvedKey = resolveExpression(node.$key, loopCtx);
    }
    const stableKey = generateKey(item, index, resolvedKey);
    const itemNode = __spreadProps(__spreadValues({}, node), {
      $each: void 0,
      $key: void 0,
      $as: void 0,
      $indexAs: void 0
    });
    return renderSingleNode(itemNode, loopCtx, stableKey);
  });
}
function renderSingleNode(node, ctx, key) {
  var _a, _b;
  const componentType = resolveComponentType(node.type, ctx);
  const resolvedProps = resolveNodeProps((_a = node.props) != null ? _a : {}, ctx);
  if (key !== void 0) {
    resolvedProps.key = key;
  }
  const children = renderChildren((_b = node.children) != null ? _b : [], ctx);
  if (children.length === 0) {
    return React__default.default.createElement(componentType, resolvedProps);
  }
  return React__default.default.createElement(componentType, resolvedProps, ...children);
}
function resolveComponentType(typeName, ctx) {
  const { components } = ctx.options;
  if (components && typeName in components) {
    return components[typeName];
  }
  return typeName.toLowerCase();
}
function resolveNodeProps(props, ctx) {
  const resolved = {};
  for (const [key, value] of Object.entries(props)) {
    resolved[key] = resolveSingleProp(key, value, ctx);
  }
  return resolved;
}
function resolveSingleProp(key, value, ctx) {
  if (isActionBinding(value)) {
    const handler = resolveHandler(value, ctx);
    return handler;
  }
  if (typeof value === "string") {
    return resolveExpression(value, ctx);
  }
  return value;
}
function renderChildren(children, ctx) {
  return children.map((child, i) => {
    if (typeof child === "string") {
      const resolved = resolveExpression(child, ctx);
      return String(resolved != null ? resolved : "");
    }
    return renderNode(child, ctx, `child_${i}`);
  });
}
var FallbackUI = ({ error }) => /* @__PURE__ */ jsxRuntime.jsxs(
  "div",
  {
    style: {
      padding: "16px",
      border: "1px solid #e74c3c",
      borderRadius: "4px",
      backgroundColor: "#fdf0ef",
      color: "#c0392b",
      fontFamily: "monospace",
      fontSize: "14px"
    },
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("strong", { children: "NextJsonComponent \u6E32\u67D3\u932F\u8AA4" }),
      error && /* @__PURE__ */ jsxRuntime.jsx("pre", { style: { marginTop: "8px", whiteSpace: "pre-wrap", fontSize: "12px" }, children: error.message })
    ]
  }
);
var ErrorBoundary = class extends React__default.default.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[NextJsonComponent] Render error caught by ErrorBoundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== void 0) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxRuntime.jsx(FallbackUI, { error: this.state.error });
    }
    return this.props.children;
  }
};
function StaticSubtree({ content }) {
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: content });
}
React__default.default.memo(StaticSubtree);
var ClientJsonHydrator = React__default.default.memo(
  ({ template, options, componentProps = {} }) => {
    const useStore = React.useMemo(() => {
      var _a;
      return createScopedStore((_a = options.initialState) != null ? _a : {});
    }, []);
    const state = useStore();
    const storeRef = React.useRef(useStore);
    storeRef.current = useStore;
    const onStoreReadyRef = React.useRef(options._onStoreReady);
    onStoreReadyRef.current = options._onStoreReady;
    React.useEffect(() => {
      if (onStoreReadyRef.current) {
        onStoreReadyRef.current((partial) => {
          storeRef.current.getState().setState(partial);
        });
      }
    }, []);
    const analyzedTemplate = React.useMemo(() => analyzeTree(template), [template]);
    const ctx = React.useMemo(
      () => ({
        state,
        setState: state.setState,
        props: componentProps,
        options
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [state, componentProps, options]
    );
    const rendered = renderNode(analyzedTemplate, ctx);
    return /* @__PURE__ */ jsxRuntime.jsx(ErrorBoundary, { children: rendered });
  }
);
ClientJsonHydrator.displayName = "ClientJsonHydrator";
function useServerActionRunner(action) {
  const [isPending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState(null);
  const dispatch = React.useCallback(
    (...args) => {
      startTransition(async () => {
        try {
          const res = await action(...args);
          setResult(res);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [action]
  );
  return { dispatch, state: { isPending, result, error } };
}
function useServerActionState(action, _actionName) {
  return useServerActionRunner(action);
}
function ServerActionHydrator({
  template,
  options,
  componentProps = {}
}) {
  var _a, _b;
  const serverActions = (_a = options.serverActions) != null ? _a : {};
  const actionRunners = {};
  for (const [name, action] of Object.entries(serverActions)) {
    const runner = useServerActionRunner(action);
    actionRunners[name] = runner;
  }
  const initialActionsStatus = Object.fromEntries(
    Object.entries(actionRunners).map(([name, { state }]) => [name, state])
  );
  const useStore = React.useMemo(() => {
    var _a2;
    return createScopedStore(__spreadProps(__spreadValues({}, (_a2 = options.initialState) != null ? _a2 : {}), {
      _actions: initialActionsStatus
    }));
  }, []);
  const storeState = useStore();
  const actionsStatus = Object.fromEntries(
    Object.entries(actionRunners).map(([name, { state }]) => [name, state])
  );
  const actionsJson = JSON.stringify(actionsStatus);
  const actionsStatusRef = React.useRef(actionsStatus);
  actionsStatusRef.current = actionsStatus;
  React.useEffect(() => {
    useStore.getState().setState({ _actions: actionsStatusRef.current });
  }, [actionsJson]);
  const bridgedRegistry = __spreadValues(__spreadValues({}, (_b = options.actionRegistry) != null ? _b : {}), Object.fromEntries(
    Object.entries(actionRunners).map(([name, { dispatch }]) => [
      name,
      (_s, _ss, _p, ...args) => dispatch(...args)
    ])
  ));
  const analyzedTemplate = React.useMemo(() => analyzeTree(template), [template]);
  const ctx = {
    state: storeState,
    setState: storeState.setState,
    props: componentProps,
    options: __spreadProps(__spreadValues({}, options), {
      actionRegistry: bridgedRegistry,
      // Clear serverActions so resolveHandler routes through actionRegistry
      // (which contains our useTransition-wrapped dispatchers) instead of
      // calling the raw server action directly.
      serverActions: {}
    })
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ErrorBoundary, { children: renderNode(analyzedTemplate, ctx) });
}

exports.ClientJsonHydrator = ClientJsonHydrator;
exports.ServerActionHydrator = ServerActionHydrator;
exports.useServerActionState = useServerActionState;
//# sourceMappingURL=client.js.map
//# sourceMappingURL=client.js.map