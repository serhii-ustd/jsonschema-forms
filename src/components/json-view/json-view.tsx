import { JsonView as Json, type Props } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import type { FC } from "react";

export const JsonView: FC<{ json: Props["data"] }> = ({ json }) => {
  return <Json data={json} />;
};

export default JsonView;
