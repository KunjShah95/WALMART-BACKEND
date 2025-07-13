#!/usr/bin/env python3
"""
Fixed ManufacturerMatcher with better error handling and debugging
"""

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings

warnings.filterwarnings("ignore")


class ManufacturerMatcher:
    def __init__(self, csv_path="manufacturers.csv"):
        try:
            print(f"Loading data from {csv_path}...")
            self.df = pd.read_csv(csv_path)
            print(f"Loaded {len(self.df)} manufacturers")

            # Clean the data
            print("Cleaning data...")

            # Handle quoted strings in materials column
            if "Supported_Materials" in self.df.columns:
                self.df["Supported_Materials"] = self.df["Supported_Materials"].astype(
                    str
                )
                self.df["Supported_Materials"] = self.df[
                    "Supported_Materials"
                ].str.strip('"')

            # Handle certifications column
            if "Certifications" in self.df.columns:
                self.df["Certifications"] = self.df["Certifications"].astype(str)
                self.df["Certifications"] = self.df["Certifications"].str.strip('"')

            # Initialize TF-IDF vectorizer
            print("Initializing TF-IDF vectorizer...")
            self.vec = TfidfVectorizer(stop_words="english")

            # Fit the vectorizer
            materials_list = self.df["Supported_Materials"].fillna("")
            if len(materials_list) > 0:
                self.vec.fit(materials_list)
                print("✓ TF-IDF vectorizer initialized successfully")
            else:
                raise ValueError("No materials data found to train vectorizer")

        except Exception as e:
            print(f"Error initializing ManufacturerMatcher: {e}")
            raise

    def find_top_suppliers(
        self, material: str, region: str = None, min_capacity: int = 0, top_n: int = 3
    ):
        """
        Find top suppliers for a given material with optional filters
        """
        try:
            print(f"Searching for material: '{material}'")
            print(f"Region filter: {region}")
            print(f"Min capacity: {min_capacity}")

            # Start with full dataframe
            df = self.df.copy()
            print(f"Starting with {len(df)} manufacturers")

            # Apply capacity filter
            df = df[df["Max_Weekly_Capacity"] >= min_capacity]
            print(f"After capacity filter: {len(df)} manufacturers")

            # Apply material filter
            material_mask = df["Supported_Materials"].str.contains(
                material, case=False, na=False
            )
            df = df[material_mask]
            print(f"After material filter: {len(df)} manufacturers")

            # Apply region filter if specified
            if region:
                region_mask = df["City"].str.contains(region, case=False, na=False)
                df = df[region_mask]
                print(f"After region filter: {len(df)} manufacturers")

            if df.empty:
                print("No manufacturers found matching criteria")
                return []

            # Calculate similarity scores
            print("Calculating similarity scores...")
            material_vec = self.vec.transform([material])
            cand_vecs = self.vec.transform(df["Supported_Materials"].fillna(""))
            df["sim_score"] = cosine_similarity(material_vec, cand_vecs)[0]

            # Calculate certification scores
            print("Calculating certification scores...")
            cert_priority = ["GOTS", "OEKO-TEX", "Fair Trade", "GRS", "FSC"]

            def calc_cert_score(cert_string):
                if pd.isna(cert_string):
                    return 0
                certs = str(cert_string).split(", ")
                return sum(1 for cert in cert_priority if cert in certs)

            df["cert_score"] = df["Certifications"].apply(calc_cert_score)

            # Calculate capacity scores (normalized)
            print("Calculating capacity scores...")
            max_cap = df["Max_Weekly_Capacity"].max()
            if max_cap > 0:
                df["cap_score"] = df["Max_Weekly_Capacity"] / max_cap
            else:
                df["cap_score"] = 0

            # Calculate composite weighted score
            print("Calculating final scores...")
            weights = {"sim": 0.5, "cert": 0.3, "cap": 0.2}
            df["final_score"] = (
                df["sim_score"] * weights["sim"]
                + (df["cert_score"] / len(cert_priority)) * weights["cert"]
                + df["cap_score"] * weights["cap"]
            )

            # Sort and return top results
            result_df = df.sort_values("final_score", ascending=False).head(top_n)
            results = result_df.to_dict(orient="records")

            print(f"Returning {len(results)} top suppliers")

            return results

        except Exception as e:
            print(f"Error in find_top_suppliers: {e}")
            import traceback

            traceback.print_exc()
            return []


def test_matcher():
    """Test function"""
    print("=== Testing Fixed ManufacturerMatcher ===")

    try:
        matcher = ManufacturerMatcher("manufacturers.csv")

        # Test search
        results = matcher.find_top_suppliers("Organic Cotton", top_n=3)

        print(f"\nFound {len(results)} suppliers for Organic Cotton:")
        for i, supplier in enumerate(results, 1):
            print(f"{i}. {supplier['Manufacturer_Name']} ({supplier['City']})")
            print(f"   Materials: {supplier['Supported_Materials']}")
            print(f"   Capacity: {supplier['Max_Weekly_Capacity']}")
            print(f"   Score: {supplier.get('final_score', 0):.3f}")
            print()

    except Exception as e:
        print(f"Test failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    test_matcher()
