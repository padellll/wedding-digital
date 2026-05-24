import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

let queue = Promise.resolve();

export async function POST(req) {

  queue = queue.then(async () => {

    const body = await req.json();

    const dirPath = path.join(
      process.cwd(),
      "data"
    );

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {
        recursive: true
      });
    }

    // FILE JSON
    const jsonPath = path.join(
      dirPath,
      "rsvp.json"
    );

    // FILE EXCEL
    const excelPath = path.join(
      dirPath,
      "rsvp.xlsx"
    );

    let data = [];

    // baca json lama
    if (fs.existsSync(jsonPath)) {

      const raw = fs.readFileSync(
        jsonPath,
        "utf-8"
      );

      data = JSON.parse(raw);
    }

    // tambah data baru
    data.push({
      Nama: body.nama,
      JumlahTamu: body.jumlahTamu,
      Kehadiran: body.kehadiran,
      Waktu: body.waktu
    });

    // simpan json dulu
    fs.writeFileSync(
      jsonPath,
      JSON.stringify(data, null, 2)
    );

    // generate excel dari json
    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "RSVP"
    );

    const excelBuffer = XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx"
      }
    );

    fs.writeFileSync(
      excelPath,
      excelBuffer
    );
  });

  try {

    await queue;

    return Response.json({
      success: true
    });

  } catch (error) {

    console.log(error);

    return Response.json(
      {
        success: false,
        error: error.message
      },
      {
        status: 500
      }
    );
  }
}