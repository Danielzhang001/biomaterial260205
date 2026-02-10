import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const productsFile = path.join(root, "assets", "data", "products.json");

function fail(message) {
  console.error(`[validate-products] ${message}`);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function main() {
  const raw = await readFile(productsFile, "utf8");

  if (raw.includes("\uFFFD")) {
    fail("检测到替代字符 U+FFFD，文件可能存在编码损坏。");
    process.exitCode = 1;
    return;
  }

  let products;
  try {
    products = JSON.parse(raw);
  } catch (error) {
    fail(`JSON 解析失败: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(products) || !products.length) {
    fail("products.json 必须是非空数组。");
    process.exitCode = 1;
    return;
  }

  const seenIds = new Set();
  let hasError = false;

  products.forEach((product, productIndex) => {
    const prefix = `product[${productIndex}]`;
    if (!hasText(product?.id)) {
      fail(`${prefix} 缺少 id`);
      hasError = true;
    } else if (seenIds.has(product.id)) {
      fail(`${prefix} id 重复: ${product.id}`);
      hasError = true;
    } else {
      seenIds.add(product.id);
    }

    ["name", "category", "description"].forEach((field) => {
      if (!hasText(product?.[field])) {
        fail(`${prefix} 缺少字段 ${field}`);
        hasError = true;
      }
    });

    if (!Array.isArray(product?.variants) || !product.variants.length) {
      fail(`${prefix} variants 必须为非空数组`);
      hasError = true;
      return;
    }

    product.variants.forEach((variant, variantIndex) => {
      const variantPrefix = `${prefix}.variants[${variantIndex}]`;
      ["sku", "mw", "end_group", "form", "pack"].forEach((field) => {
        if (!hasText(variant?.[field])) {
          fail(`${variantPrefix} 缺少字段 ${field}`);
          hasError = true;
        }
      });

      if (variant?.price_cny !== null && variant?.price_cny !== undefined && typeof variant.price_cny !== "number") {
        fail(`${variantPrefix}.price_cny 需为 number 或 null`);
        hasError = true;
      }
    });
  });

  if (hasError) {
    process.exitCode = 1;
    return;
  }

  console.log(`[validate-products] OK (${products.length} products)`);
}

main().catch((error) => {
  fail(`执行失败: ${error.message}`);
  process.exitCode = 1;
});
