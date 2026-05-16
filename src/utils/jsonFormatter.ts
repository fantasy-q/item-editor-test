// src/utils/jsonFormatter.ts

/**
 * 将游戏数据库对象转化为：核心 item 各自独占一行的精美 JSON 字符串
 */
export function stringifyDatabaseInline(db: any): string {
  // 1. 先把基础的外壳和 schema 按照标准 2 空格缩进序列化
//   const schemaPart = JSON.stringify(db.schema, null, 2);
  const inlineSchema = db.schema.map((item: any) => {
    return `    ${JSON.stringify(item)}`;
  });

  // 2. 将 items 数组里的每一个单独的 item，强制压缩成单行字符串
  const inlineItems = db.items.map((item: any) => {
    return `    ${JSON.stringify(item)}`;
  });

  // 3. 将单行 items 用逗号和换行符拼接起来
  const itemsPart = `[\n${inlineItems.join(',\n')}\n  ]`;
  const schemaPart = `[\n${inlineSchema.join(',\n')}\n  ]`;

  // 4. 手动组装成最终的高颜值 JSON
//   return `{\n  "schema": ${schemaPart.replace(/\n/g, '\n  ')},\n  "items": ${itemsPart}\n}`;
  return `{\n  "schema": ${schemaPart}\n},\n  "items": ${itemsPart}\n}`;
}
