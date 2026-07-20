import { Schema, model, models, type Document } from "mongoose";

export interface IProductCategorySpecGroup {
  group: string;
  keys: string[];
}

export interface IProductCategory extends Document {
  name: string;
  slug: string;
  description: string;
  specGroups: IProductCategorySpecGroup[];
}

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    specGroups: [
      {
        group: { type: String, required: true },
        keys: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true }
);

const ProductCategory = models.ProductCategory || model<IProductCategory>("ProductCategory", ProductCategorySchema);

export default ProductCategory;
