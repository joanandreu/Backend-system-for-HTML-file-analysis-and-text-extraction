import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as cheerio from 'cheerio';
import { sanitizeHtml } from "~/utils/html-parser";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const htmlContent = formData.get("htmlContent");
    const textBlocks = JSON.parse(formData.get("textBlocks") as string);

    if (typeof htmlContent !== 'string' || !Array.isArray(textBlocks)) {
      return json({ error: "Invalid data provided" }, { status: 400 });
    }

    let $ = cheerio.load(htmlContent);

    textBlocks.forEach((block: any) => {
      const element = $(`#${block.id.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1")}`);
      if (element.length) {
        element.text(block.text);
      }
    });

    const sanitizedHtml = sanitizeHtml($('body').html() || '');

    return json({ updatedHtml: sanitizedHtml });
  } catch (error: any) {
    console.error("Error updating HTML content:", error);
    return json({ error: "Failed to update HTML content" }, { status: 500 });
  }
}
