import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, unstable_parseMultipartFormData, UploadHandler } from "@remix-run/node";
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { extractEditableContent } from "~/utils/html-parser";

const uploadHandler: UploadHandler = async ({ name, data, filename }) => {
  if (name !== "htmlFile") {
    return undefined;
  }

  const fileBuffer = await new Response(data).arrayBuffer();
  const fileContent = Buffer.from(fileBuffer).toString('utf-8');
  return fileContent;
};

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const htmlFile = formData.get("htmlFile");

    if (typeof htmlFile !== 'string') {
      return json({ error: "No HTML file uploaded" }, { status: 400 });
    }

    const editableContent = extractEditableContent(htmlFile);
    return json({ editableContent });
  } catch (error: any) {
    console.error("Error processing HTML file:", error);
    return json({ error: "Failed to process HTML file" }, { status: 500 });
  }
}
