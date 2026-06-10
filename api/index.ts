export default async function handler(req: any, res: any) {
    try {
      // Dynamically import the Express app
      const { default: app } = await import('../server');
      
      // Forward the request and response to the Express app
      return app(req, res);
    } catch (error: any) {
      console.error("Vercel Serverless Function Startup Error:", error);
      res.status(500).json({
        success: false,
        message: "Vercel Serverless Function failed to start/initialize.",
        error: error?.message || String(error),
        stack: error?.stack,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
        }
      });
    }
  }
  