const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const MongoDB = require("../utils/mongodb.util");
const PublisherService = require("./nhaxuatban.service");

class BookService {
  constructor(client) {
    this.Book = client.db().collection("sach");
  }
  extractBookData(data) {
    const book = {
      masach: data.masach,
      tensach: data.tensach,
      dongia: data.dongia,
      soquyen: data.soquyen,
      namxuatban: data.namxuatban,
      manxb: data.manxb,
      tacgia_nguongoc: data.tacgia_nguongoc,
      hinhsach: data.hinhsach,
      mota: data.mota,
    };

    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );
    return book;
  }

  async create(payload) {
    const data = this.extractBookData(payload);
    if (!data.masach || !data.tensach) {
      throw new Error("Mã sách hoặc tên sách không hợp lệ.");
    }

    const isExist = await this.find({ masach: data.masach });
    console.log(isExist.length);

    if (isExist.length > 0) {
      return { errorMessage: "Mã sách đã tồn tại" };
    }

    const document = await this.Book.findOneAndUpdate(
      { masach: data.masach },
      { $set: data },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    return document;
  }

  async count(filter) {
    const total = await this.Book.countDocuments(filter);
    return total;
  }

  async update(id, payload) {
    const data = this.extractBookData(payload);
    const document = await this.Book.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      {
        returnDocument: "after",
      }
    );
    return document;
  }

  async find(filter) {
    const cursor = await this.Book.find(filter).sort({ masach: 1 });
    return await cursor.toArray();
  }
  async findByName(name) {
    return await this.find({ tensach: { $regex: new RegExp(name, "i") } });
  }
  async findByAuthor(author) {
    return await this.find({
      tacgia_nguongoc: { $regex: new RegExp(author, "i") },
    });
  }
  async findByPublisherMaNXB(manxb) {
    return await this.find({
      manxb: manxb,
    });
  }

  async findById(id) {
    const document = await this.Book.findOne({
      _id: new ObjectId(id),
    });
    return document;
  }

  async findByMasach(masach) {
    const document = await this.Book.findOne({ masach });
    return document;
  }

  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return result.deletedCount;
  }

  async deleteOne(id) {
    const document = await this.Book.findOneAndDelete(
      {
        _id: new ObjectId(id),
      },
      { returnDocument: "after" }
    );
    return document;
  }

  async updateBookQuantity(masach, quantityChange) {
    // Tìm sách theo masach
    const book = await this.Book.findOne({ masach });
    if (!book) {
      throw new Error("Không tìm thấy sách với mã được cung cấp");
    }

    // Cập nhật số lượng sách
    const newQuantity = book.soquyen + quantityChange;
    if (newQuantity < 0) {
      throw new Error("Số lượng sách không hợp lệ (không thể nhỏ hơn 0)");
    }

    const updatedBook = await this.Book.findOneAndUpdate(
      { masach },
      { $set: { soquyen: newQuantity } },
      { returnDocument: "after" }
    );

    return updatedBook.value;
  }
}

module.exports = BookService;