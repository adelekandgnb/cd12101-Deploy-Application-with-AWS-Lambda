export function transformDynamoDBItems(items) {
  return items.map(item => {
    const transformedItem = {};
    for (const [key, value] of Object.entries(item)) {
      const dataType = Object.keys(value)[0];
      transformedItem[key] = value[dataType];
    }
    return transformedItem;
  });
}