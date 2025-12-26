
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeShelfImage = async (base64Image: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    };

    const textPart = {
      text: `Atue como um especialista em prateleiras de varejo e instrutor de fotografia. Analise esta foto de uma prateleira de produtos alimentícios. 
      
      1. Analise a execução da prateleira: nível de estoque, itens fora de estoque e organização do "facing" (frente do produto).
      2. Analise a qualidade da foto: forneça conselhos sobre iluminação, ângulo e foco.
      3. Identifique pontos específicos na imagem: Liste áreas que estão excelentes (ex: "facing perfeito no topo") e áreas que precisam de atenção (ex: "vazio no canto inferior esquerdo" ou "reflexo excessivo no meio").
      
      Retorne a análise em um formato estruturado em PORTUGUÊS.`
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stockPercentage: { type: Type.NUMBER, description: "Nível de estoque estimado de 0 a 100" },
            shelfAnalysis: { type: Type.STRING, description: "Resumo conciso do estoque e organização" },
            photoFeedback: { type: Type.STRING, description: "Conselhos específicos sobre iluminação, ângulo e nitidez" },
            isHighQuality: { type: Type.BOOLEAN, description: "Verdadeiro se a qualidade da foto atender aos padrões profissionais" },
            observations: {
              type: Type.ARRAY,
              description: "Lista de pontos específicos identificados na foto",
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "Tipo: 'positivo' ou 'negativo'" },
                  location: { type: Type.STRING, description: "Localização na foto (ex: Canto superior direito)" },
                  description: { type: Type.STRING, description: "Descrição detalhada do que foi observado" }
                },
                required: ["type", "location", "description"]
              }
            }
          },
          required: ["stockPercentage", "shelfAnalysis", "photoFeedback", "isHighQuality", "observations"]
        }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Falha na análise do Gemini:", error);
    return null;
  }
};
