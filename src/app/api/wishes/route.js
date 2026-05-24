import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(req) {

  const body = await req.json();

  const { id } = body;

  const { error } = await supabase
    .from("wishes")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true
  });
}