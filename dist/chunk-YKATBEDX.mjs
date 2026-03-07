import { __spreadProps, __spreadValues } from './chunk-3P2SZ7UA.mjs';

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
function isStaticNode(node) {
  return node.isStatic === true;
}

export { analyzeNode, analyzeTree, isStaticNode };
//# sourceMappingURL=chunk-YKATBEDX.mjs.map
//# sourceMappingURL=chunk-YKATBEDX.mjs.map