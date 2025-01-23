export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      vendors: {
        Row: {
          "bridal_hair_&_makeup_price": string | null
          "bridal_price_h&m_unless_indicated": string | null
          "bridesmaid_hair_&_makeup_price": string | null
          "bridesmaid_price_h&m_unless_indicated": string | null
          business_name: string | null
          cover_image: string | null
          email: string | null
          id: string
          ig_handle: string | null
          instagram: string | null
          lists_prices: string | null
          logo: string | null
          region: string | null
          specialization: string | null
          "travel_bridal_prices_h&m_unless_indicated": string | null
          travels_world_wide: string | null
          website: string | null
          what_is_your_minimum_spend: string | null
        }
        Insert: {
          "bridal_hair_&_makeup_price"?: string | null
          "bridal_price_h&m_unless_indicated"?: string | null
          "bridesmaid_hair_&_makeup_price"?: string | null
          "bridesmaid_price_h&m_unless_indicated"?: string | null
          business_name?: string | null
          cover_image?: string | null
          email?: string | null
          id?: string
          ig_handle?: string | null
          instagram?: string | null
          lists_prices?: string | null
          logo?: string | null
          region?: string | null
          specialization?: string | null
          "travel_bridal_prices_h&m_unless_indicated"?: string | null
          travels_world_wide?: string | null
          website?: string | null
          what_is_your_minimum_spend?: string | null
        }
        Update: {
          "bridal_hair_&_makeup_price"?: string | null
          "bridal_price_h&m_unless_indicated"?: string | null
          "bridesmaid_hair_&_makeup_price"?: string | null
          "bridesmaid_price_h&m_unless_indicated"?: string | null
          business_name?: string | null
          cover_image?: string | null
          email?: string | null
          id?: string
          ig_handle?: string | null
          instagram?: string | null
          lists_prices?: string | null
          logo?: string | null
          region?: string | null
          specialization?: string | null
          "travel_bridal_prices_h&m_unless_indicated"?: string | null
          travels_world_wide?: string | null
          website?: string | null
          what_is_your_minimum_spend?: string | null
        }
        Relationships: []
      }
      vendors_small: {
        Row: {
          "Bridal Hair & Makeup Price": number | null
          "bridal_price_H&M_unless_indicated": number | null
          "Bridesmaid Hair & Makeup Price": number | null
          "Bridesmaid price (H&M unless indicated)": string | null
          business_name: string | null
          "Cover Image": string | null
          email: string | null
          id: string
          "IG Handle": string | null
          instagram: string | null
          "Lists prices": string | null
          logo: string | null
          region: string | null
          Specialization: string | null
          "Travel bridal prices (H&M unless indicated)": string | null
          travels_world_wide: string | null
          website: string | null
          "What is your minimum spend": string | null
        }
        Insert: {
          "Bridal Hair & Makeup Price"?: number | null
          "bridal_price_H&M_unless_indicated"?: number | null
          "Bridesmaid Hair & Makeup Price"?: number | null
          "Bridesmaid price (H&M unless indicated)"?: string | null
          business_name?: string | null
          "Cover Image"?: string | null
          email?: string | null
          id?: string
          "IG Handle"?: string | null
          instagram?: string | null
          "Lists prices"?: string | null
          logo?: string | null
          region?: string | null
          Specialization?: string | null
          "Travel bridal prices (H&M unless indicated)"?: string | null
          travels_world_wide?: string | null
          website?: string | null
          "What is your minimum spend"?: string | null
        }
        Update: {
          "Bridal Hair & Makeup Price"?: number | null
          "bridal_price_H&M_unless_indicated"?: number | null
          "Bridesmaid Hair & Makeup Price"?: number | null
          "Bridesmaid price (H&M unless indicated)"?: string | null
          business_name?: string | null
          "Cover Image"?: string | null
          email?: string | null
          id?: string
          "IG Handle"?: string | null
          instagram?: string | null
          "Lists prices"?: string | null
          logo?: string | null
          region?: string | null
          Specialization?: string | null
          "Travel bridal prices (H&M unless indicated)"?: string | null
          travels_world_wide?: string | null
          website?: string | null
          "What is your minimum spend"?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
