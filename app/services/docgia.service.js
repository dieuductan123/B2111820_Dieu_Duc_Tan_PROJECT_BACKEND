const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("docgia");
  }
  extractReaderData(payload) {
    const reader = {
      madocgia: payload.madocgia,
      holot: payload.holot,
      ten: payload.ten,
      ngaysinh: payload.ngaysinh,
      phai: payload.phai,
      diachi: payload.diachi,
      dienthoai: payload.dienthoai,
      password: payload.password,
    };
    Object.keys(reader).forEach(
      (key) => reader[key] === undefined && delete reader[key]
    );
    return reader;
  }

  async find(filter) {
    const cursor = await this.Reader.find(filter);
    return await cursor.toArray();
  }

  async findByName(name) {
    const result = await this.find({
      $or: [
        { ten: { $regex: new RegExp(name, "i") } },
        { holot: { $regex: new RegExp(name, "i") } },
      ],
    });
    return result;
  }

  async findByPhone(phone) {
    const result = await this.find({
      dienthoai: { $regex: new RegExp(phone, "i") },
    });
    return result;
  }

  async findById(id) {
    const result = await this.Reader.findOne({ _id: new ObjectId(id) });
    console.log(result);
    return result;
  }

  async deleteAll() {
    const result = await this.Reader.deleteMany({});
    return result.deletedCount;
  }

  async delete(id) {
    const result = await this.Reader.findOneAndDelete({ madocgia: id });
    return result;
  }

  async create(payload) {
    const reader = this.extractReaderData(payload);
    const result = await this.Reader.findOneAndUpdate(
      { madocgia: reader.madocgia },
      { $set: reader },
      {
        returnDocument: "after",
        upsert: true,
      }
    );
    return result;
  }

  async update(id, payload) {
    const readerUpdate = this.extractReaderData(payload);
    const result = await this.Reader.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: readerUpdate },
      {
        returnDocument: "after",
      }
    );
    return result;
  }
}

module.exports = ReaderService;
