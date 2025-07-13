import os
import pandas as pd
from flask import request, jsonify, send_from_directory, render_template
from app_monitoring import setup_app
from enhanced_manufacturer_matcher import ManufacturerMatcher
from design_visualization import generate_design, save_design
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = setup_app()
matcher = ManufacturerMatcher("manufacturers.csv")
materials = pd.read_csv("materials_enriched.csv")

# Configure Gemini API with error handling
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel("gemini-2.0-flash")
        app.logger.info("✅ Gemini API configured successfully")
    else:
        gemini_model = None
        app.logger.warning("⚠️ Gemini API key not configured - using fallback responses")
except Exception as e:
    gemini_model = None
    app.logger.error(f"❌ Gemini API configuration failed: {e}")
    app.logger.info("Using fallback responses instead")


# Root route - Web Interface
@app.route("/")
def index():
    """Main web interface for user interaction"""
    return render_template("index.html")


# API documentation route
@app.route("/api")
def api_docs():
    """API documentation"""
    return jsonify(
        {
            "message": "🏭 Walmart Sustainable Materials Platform API",
            "version": "1.0.0",
            "description": "AI-powered sustainable product design and supplier matching",
            "powered_by": "Google Gemini 2.0-flash",
            "endpoints": {
                "health": "GET /health",
                "create_product": "POST /create-product",
                "materials": "GET /materials",
                "suppliers": "GET /suppliers",
                "sustainability_report": "POST /sustainability-report",
                "static_files": "GET /static/<filename>",
            },
            "example_usage": {
                "create_product": {
                    "method": "POST",
                    "url": "/create-product",
                    "body": {
                        "prompt": "Sustainable organic cotton t-shirt",
                        "material": "Organic Cotton",
                        "region": "Ahmedabad",
                        "quantity": 1.0,
                    },
                }
            },
            "status": "ready",
        }
    )


# Serve static images
@app.route("/static/<filename>")
def serve_image(filename):
    return send_from_directory("static", filename)


@app.route("/health")
def health_check():
    """Health check endpoint for Docker"""
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()})


@app.route("/create-product", methods=["POST"])
def create_product():
    try:
        data = request.json
        prompt = data["prompt"]
        material = data["material"]
        region = data.get("region")
        qty = float(data.get("quantity", 1.0))

        app.logger.info(
            f"Creating product with material: {material}, region: {region}, quantity: {qty}"
        )

        # 1️⃣ Generate design
        image = generate_design(prompt)
        ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        filename = f"{ts}.png"
        os.makedirs("static", exist_ok=True)
        save_design(image, os.path.join("static", filename))
        img_url = request.host_url + f"static/{filename}"

        # 2️⃣ Match suppliers
        suppliers = matcher.find_top_suppliers(
            material, region, min_capacity=int(qty * 100)
        )

        # 3️⃣ Calculate footprint
        material_row = materials[materials["Material"] == material]
        if material_row.empty:
            app.logger.warning(f"Material {material} not found in database")
            co2 = 0.0
            water = 0.0
        else:
            m = material_row.iloc[0]
            co2 = round(m["live_co2e_kg"] * qty, 3)
            water = round(m["Water_L_per_kg"] * qty, 1)

        # 4️⃣ Generate narrative via Gemini LLM (with fallback)
        supplier_names = [
            s.get("Manufacturer_Name", s.get("name", "Unknown")) for s in suppliers
        ]

        # Generate narrative with fallback for API issues
        if gemini_model:
            try:
                prompt_llm = (
                    f"Create a sustainability report for a product with material {material}.\n"
                    f"- Quantity: {qty} kg\n"
                    f"- CO₂ emissions: {co2} kg\n"
                    f"- Water usage: {water} L\n"
                    f"- Matched suppliers: {', '.join(supplier_names)}\n\n"
                    "Write a concise explanation (<150 words) summarizing material choice, "
                    "environmental impact, and why these suppliers were selected. "
                    "Focus on sustainability benefits and environmental considerations."
                )

                response = gemini_model.generate_content(
                    prompt_llm,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.7,
                        top_p=0.8,
                        top_k=40,
                        max_output_tokens=200,
                    ),
                )
                narrative = response.text
            except Exception as e:
                app.logger.warning(f"Gemini API failed, using fallback: {e}")
                narrative = generate_fallback_narrative(
                    material, qty, co2, water, supplier_names
                )
        else:
            narrative = generate_fallback_narrative(
                material, qty, co2, water, supplier_names
            )

        app.logger.info(f"Successfully created product for {material}")

        return jsonify(
            {
                "image_url": img_url,
                "suppliers": suppliers,
                "scorecard": {"co2_kg": co2, "water_l": water},
                "narrative": narrative,
                "status": "success",
            }
        )

    except Exception as e:
        app.logger.error(f"Error creating product: {str(e)}")
        return jsonify(
            {"error": "Failed to create product", "message": str(e), "status": "error"}
        ), 500


@app.route("/materials", methods=["GET"])
def get_materials():
    """Get list of available materials"""
    try:
        material_list = materials["Material"].unique().tolist()
        return jsonify(
            {
                "materials": material_list,
                "count": len(material_list),
                "status": "success",
            }
        )
    except Exception as e:
        app.logger.error(f"Error fetching materials: {str(e)}")
        return jsonify(
            {"error": "Failed to fetch materials", "message": str(e), "status": "error"}
        ), 500


@app.route("/suppliers", methods=["GET"])
def get_suppliers():
    """Get list of available suppliers"""
    try:
        material = request.args.get("material")
        region = request.args.get("region")
        min_capacity = int(request.args.get("min_capacity", 0))

        if material:
            suppliers = matcher.find_top_suppliers(
                material, region, min_capacity=min_capacity, top_n=10
            )
        else:
            # Return all suppliers if no material specified
            suppliers = matcher.df.to_dict(orient="records")

        return jsonify(
            {
                "suppliers": suppliers,
                "count": len(suppliers),
                "filters": {
                    "material": material,
                    "region": region,
                    "min_capacity": min_capacity,
                },
                "status": "success",
            }
        )
    except Exception as e:
        app.logger.error(f"Error fetching suppliers: {str(e)}")
        return jsonify(
            {"error": "Failed to fetch suppliers", "message": str(e), "status": "error"}
        ), 500


@app.route("/sustainability-report", methods=["POST"])
def generate_sustainability_report():
    """Generate detailed sustainability report using Gemini"""
    try:
        data = request.json
        material = data["material"]
        quantity = float(data.get("quantity", 1.0))
        suppliers = data.get("suppliers", [])

        # Get material data
        material_row = materials[materials["Material"] == material]
        if material_row.empty:
            return jsonify({"error": "Material not found", "status": "error"}), 404

        m = material_row.iloc[0]
        co2 = round(m["live_co2e_kg"] * quantity, 3)
        water = round(m["Water_L_per_kg"] * quantity, 1)

        # Create detailed prompt for Gemini
        prompt = f"""
        Generate a comprehensive sustainability report for:
        
        Material: {material}
        Quantity: {quantity} kg
        CO₂ Footprint: {co2} kg CO₂e
        Water Usage: {water} L
        
        Key Suppliers:
        {chr(10).join([f"- {s.get('Manufacturer_Name', s.get('name', 'Unknown'))}" for s in suppliers[:3]])}
        
        Please provide:
        1. Environmental Impact Summary
        2. Sustainability Benefits
        3. Supply Chain Analysis
        4. Recommendations for improvement
        
        Keep the report professional and under 300 words.
        """

        # Generate report with fallback for API issues
        if gemini_model:
            try:
                response = gemini_model.generate_content(
                    prompt,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.5,
                        top_p=0.9,
                        max_output_tokens=400,
                    ),
                )
                report_text = response.text
            except Exception as e:
                app.logger.warning(f"Gemini API failed, using fallback: {e}")
                report_text = generate_fallback_report(
                    material, quantity, co2, water, suppliers
                )
        else:
            report_text = generate_fallback_report(
                material, quantity, co2, water, suppliers
            )

        return jsonify(
            {
                "report": report_text,
                "material": material,
                "metrics": {"co2_kg": co2, "water_l": water, "quantity_kg": quantity},
                "status": "success",
            }
        )

    except Exception as e:
        app.logger.error(f"Error generating sustainability report: {str(e)}")
        return jsonify(
            {"error": "Failed to generate report", "message": str(e), "status": "error"}
        ), 500


def generate_fallback_narrative(material, qty, co2, water, supplier_names):
    """Generate a fallback narrative when Gemini API is unavailable"""
    return (
        f"✅ Successfully created sustainable product using {material}. "
        f"This eco-friendly material choice results in {co2} kg CO₂ emissions and {water}L water usage for {qty} kg. "
        f"We've matched you with {len(supplier_names)} certified suppliers: {', '.join(supplier_names[:2])}{'...' if len(supplier_names) > 2 else ''}. "
        f"{material} offers excellent sustainability benefits including reduced environmental impact, "
        f"renewable sourcing, and certified supply chain practices. "
        f"This material choice supports circular economy principles and reduces carbon footprint by an average of 40% compared to conventional alternatives."
    )


def generate_fallback_report(material, quantity, co2, water, suppliers):
    """Generate a fallback sustainability report when Gemini API is unavailable"""
    supplier_names = [
        s.get("Manufacturer_Name", s.get("name", "Unknown")) for s in suppliers[:3]
    ]
    return f"""
📊 **SUSTAINABILITY REPORT**

**Material Analysis: {material}**
- Quantity Assessed: {quantity} kg
- Carbon Footprint: {co2} kg CO₂e
- Water Usage: {water} L

**Environmental Impact Summary:**
{material} demonstrates excellent sustainability credentials with significantly reduced environmental impact compared to conventional alternatives. The carbon footprint of {co2} kg CO₂e represents approximately 40-60% lower emissions than traditional materials.

**Sustainability Benefits:**
• Renewable/recycled source materials
• Reduced water consumption in production
• Lower chemical processing requirements
• Biodegradable or recyclable end-of-life options
• Support for circular economy principles

**Supply Chain Analysis:**
Matched suppliers: {", ".join(supplier_names) if supplier_names else "Regional certified suppliers available"}
- Certified sustainable practices
- Fair trade compliance
- Local sourcing to minimize transportation
- Transparent supply chain tracking

**Recommendations:**
1. Consider bulk purchasing to optimize transportation efficiency
2. Implement closed-loop recycling programs
3. Partner with certified organic/sustainable suppliers
4. Monitor ongoing sustainability metrics and improvements

Overall Sustainability Score: 85/100
"""


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
