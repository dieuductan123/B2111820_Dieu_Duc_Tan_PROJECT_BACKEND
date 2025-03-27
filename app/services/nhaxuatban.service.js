const { ObjectId } = require("mongodb");

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("nhaxuatban");
  }
  extractPublisherData(payload) {
    const publisher = {
      manxb: payload.manxb.toUpperCase(),
      tennxb: payload.tennxb,
      diachi: payload.diachi,
    };

    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key]
    );

    return publisher;
  }
  async find(filter) {
    const cursor = await this.Publisher.find(filter);
    return await cursor.toArray();
  }
  async findByName(name) {
    return await this.find({
      tennxb: { $regex: new RegExp(name), $options: "i" },
    });
  }
  async findById(id) {
    const result = await this.Publisher.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteOne(id) {
    const MongoDB = require("../utils/mongodb.util");
    const BookService = require("./sach.service");
    const bookService = new BookService(MongoDB.client);

    const publisher = await this.findById(id);

    const existingInBook = await bookService.findByPublisherMaNXB(
      publisher.manxb
    );

    if (existingInBook.length > 0) {
      return {
        errorMessage: "Không thể xóa nhà xuất bản này vì có sách liên kết.",
      };
    }

    const result = await this.Publisher.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result;
  }

  async create(payload) {
    const publisher = this.extractPublisherData(payload);

    const isExist = await this.find({
      manxb: { $regex: new RegExp(publisher.manxb.trim(), "i") },
    });

    if (isExist.length > 0)
      return { errorMessage: "Mã nhà xuất bản đã tồn tại" };

    const result = await this.Publisher.findOneAndUpdate(
      { manxb: publisher.manxb },
      { $set: publisher },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    return result;
  }
  async update(id, payload) {
    const publisherUpdate = this.extractPublisherData(payload);
    const result = await this.Publisher.findOneAndUpdate(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : null },
      { $set: publisherUpdate },
      {
        returnDocument: "after",
      }
    );

    // console.log(result);

    return result;
  }
}

module.exports = PublisherService;