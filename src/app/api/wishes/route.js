import fs from "fs";
import path from "path";

// lokasi file
const filePath = path.join(
  process.cwd(),
  "data",
  "wishes.json"
);

// queue anti tabrakan
let queue = Promise.resolve();


// ==============================
// GET - ambil semua ucapan
// ==============================
export async function GET() {

  try {

    if (!fs.existsSync(filePath)) {

      return Response.json([]);
    }

    const data = fs.readFileSync(
      filePath,
      "utf-8"
    );

    return Response.json(
      JSON.parse(data)
    );

  } catch (error) {

    console.log(error);

    return Response.json(
      [],
      {
        status: 500
      }
    );
  }
}


// ==============================
// POST - tambah ucapan
// ==============================
export async function POST(req) {

  queue = queue.then(async () => {

    const body = await req.json();

    const dirPath = path.join(
      process.cwd(),
      "data"
    );

    // buat folder data
    if (!fs.existsSync(dirPath)) {

      fs.mkdirSync(dirPath, {
        recursive: true
      });
    }

    let wishes = [];

    // baca file lama
    if (fs.existsSync(filePath)) {

      const oldData = fs.readFileSync(
        filePath,
        "utf-8"
      );

      wishes = JSON.parse(oldData);
    }

    // tambah ucapan baru ke atas
    wishes.unshift({
      name: body.name,
      text: body.text,
      createdAt: new Date().toISOString()
    });

    // simpan file
    fs.writeFileSync(
      filePath,
      JSON.stringify(wishes, null, 2)
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


// ==============================
// DELETE - hapus 1 ucapan
// ==============================
export async function DELETE(req) {

  queue = queue.then(async () => {

    const body = await req.json();

    if (!fs.existsSync(filePath)) {

      return;
    }

    const data = fs.readFileSync(
      filePath,
      "utf-8"
    );

    let wishes = JSON.parse(data);

    // hapus berdasarkan index
    wishes.splice(body.index, 1);

    // simpan ulang
    fs.writeFileSync(
      filePath,
      JSON.stringify(wishes, null, 2)
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


// ==============================
// PUT - hapus semua ucapan
// ==============================
export async function PUT() {

  queue = queue.then(async () => {

    fs.writeFileSync(
      filePath,
      JSON.stringify([], null, 2)
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