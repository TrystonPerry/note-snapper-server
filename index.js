import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: "sandbox-412123",
  location: "us-central1",
});
const model = "gemini-pro-vision";

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generation_config: {
    max_output_tokens: 2048,
    temperature: 0.4,
    top_p: 1,
    top_k: 32,
  },
});

import express from "express";
const app = express();

import cors from "cors";
app.use(cors());

import bodyParser from "body-parser";

app.use(bodyParser.json({ limit: "5gb" }));

app.post("/read", async (req, res) => {
  try {
    const { image, prompt } = req.body;

    const streamingResp = await generativeModel.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const result = await streamingResp.response;
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
