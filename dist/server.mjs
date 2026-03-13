import { ServerActionHydrator } from './chunk-IU7JQMRT.mjs';
import { analyzeTree } from './chunk-YKATBEDX.mjs';
import './chunk-ZFUZUVYD.mjs';
import { __objRest } from './chunk-3P2SZ7UA.mjs';
import { jsx } from 'react/jsx-runtime';
import { unstable_cache } from 'next/cache';

async function NextJsonComponent(_a) {
  var _b = _a, {
    template,
    options = {}
  } = _b, rest = __objRest(_b, [
    "template",
    "options"
  ]);
  if (!template || typeof template !== "object") {
    console.error("[NextJsonComponent] Invalid template: must be a non-null object.");
    return /* @__PURE__ */ jsx("div", { className: "njc-error", children: "NextJsonComponent: Invalid template." });
  }
  const analyzedTemplate = analyzeTree(template);
  const componentProps = rest;
  const clientOptions = {
    initialState: options.initialState,
    components: options.components,
    actionRegistry: options.actionRegistry,
    serverActions: options.serverActions
  };
  return /* @__PURE__ */ jsx(
    ServerActionHydrator,
    {
      template: analyzedTemplate,
      options: clientOptions,
      componentProps
    }
  );
}
function templateTag(templateId) {
  return `njc-template:${templateId}`;
}
var ALL_TEMPLATES_TAG = "njc-templates";
function createTemplateFetcher(fetcher, options = {}) {
  var _a, _b, _c;
  const revalidate = (_a = options.revalidate) != null ? _a : 60;
  const getTags = (_b = options.getTags) != null ? _b : ((id) => [templateTag(id), ALL_TEMPLATES_TAG]);
  const getCacheKey = (_c = options.getCacheKey) != null ? _c : ((id) => ["njc-template", id]);
  return async (templateId, context) => {
    const cachedFn = unstable_cache(
      async () => {
        const ast = await fetcher(templateId, context);
        if (!ast || typeof ast !== "object" || !("type" in ast)) {
          throw new Error(
            `[NextJsonComponent] template-fetcher: The fetcher returned an invalid JsonASTNode for template "${templateId}". Missing "type" field.`
          );
        }
        return ast;
      },
      getCacheKey(templateId),
      {
        revalidate,
        tags: getTags(templateId)
      }
    );
    return cachedFn();
  };
}
var getTemplate = createTemplateFetcher(async (templateId) => {
  const cmsApiUrl = process.env.CMS_API_URL;
  if (!cmsApiUrl) {
    throw new Error(
      "[NextJsonComponent] default getTemplate(): CMS_API_URL is not set. Set it in your environment or build your own fetcher using createTemplateFetcher()."
    );
  }
  const url = `${cmsApiUrl.replace(/\/$/, "")}/templates/${templateId}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `[NextJsonComponent] default getTemplate(): Failed to load template "${templateId}". HTTP ${res.status} from ${url}`
    );
  }
  return res.json();
});

export { ALL_TEMPLATES_TAG, NextJsonComponent, createTemplateFetcher, getTemplate, templateTag };
//# sourceMappingURL=server.mjs.map
//# sourceMappingURL=server.mjs.map