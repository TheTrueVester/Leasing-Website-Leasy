// Utility function to transform default `_id` fields into `id`
export const docTransform = (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
  return ret;
};
