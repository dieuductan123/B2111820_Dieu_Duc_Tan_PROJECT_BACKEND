const { ObjectId } = require("mongodb");

class BorrowedBookTracking {
  constructor(client) {
    this.BorrowedBookTracking = client.db().collection("theodoimuonsach");
  }
  extractBorrowedBookTrackingData(payload) {
    const borrowedBookTrackingData = {
      madocgia: payload.madocgia,
      masach: payload.masach,
      ngaymuon: payload.ngaymuon,
      ngaytra: payload.ngaytra,
      trangthai: payload.trangthai,
      soquyen: payload.soquyen,
    };
    Object.keys(borrowedBookTrackingData).forEach(
      (key) =>
        borrowedBookTrackingData[key] === undefined &&
        delete borrowedBookTrackingData[key]
    );
    return borrowedBookTrackingData;
  }

  async create(payload) {
    console.log(payload);

    const data = this.extractBorrowedBookTrackingData(payload);
    const document = await this.BorrowedBookTracking.insertOne(data);
    return document;
  }
  async update(id, payload = {}) {
    const data = this.extractBorrowedBookTrackingData(payload);

    const document = await this.BorrowedBookTracking.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    );

    return document;
  }
  async find(filter) {
    const documents = await this.BorrowedBookTracking.aggregate([
      {
        $lookup: {
          from: "docgia",
          localField: "madocgia",
          foreignField: "madocgia",
          as: "docgia_muon",
        },
      },

      {
        $unwind: "$docgia_muon",
      },
      {
        $lookup: {
          from: "sach",
          localField: "masach",
          foreignField: "masach",
          as: "sach_muon",
        },
      },
      {
        $unwind: "$sach_muon",
      },
      {
        $match: filter,
      },
      {
        $sort: {
          ngaymuon: 1,
        },
      },
      {
        $project: {
          _id: 1,
          ngaymuon: 1,
          ngaytra: 1,
          trangthai: 1,
          soquyen: 1,
          holot: "$docgia_muon.holot",
          ten: "$docgia_muon.ten",
          tacgia: "$sach_muon.tacgia_nguongoc",
          tensach: "$sach_muon.tensach",
        },
      },
    ]);
    return await documents.toArray();
  }

  async getHistory(madocgia) {
    const documents = await this.find({
      madocgia: madocgia,
    });
    return documents;
  }

  async findByTimeStartToTimeEnd(startTime, endTime) {
    const document = await this.BorrowedBookTracking.find({
      $and: [
        {
          ngaymuon: { $gte: startTime },
        },
        {
          ngaytra: { $lte: endTime },
        },
      ],
    });
    return document;
  }

  async findByStatus(status) {
    const filter = {
      trangthai: { $regex: status, $options: "i" },
    };
    return this.find(filter);
  }

  async findBySearchKey(searchKey) {
    const filter = {
      $or: [
        { "docgia_muon.ten": { $regex: searchKey, $options: "i" } },
        { "docgia_muon.holot": { $regex: searchKey, $options: "i" } },
        { "sach_muon.tensach": { $regex: searchKey, $options: "i" } },
      ],
    };
    return this.find(filter);
  }

  async findOne(id) {
    const document = await this.BorrowedBookTracking.findOne({
      _id: new ObjectId(id),
    });

    return document;
  }

  async deleteOne(id) {
    const result = await this.BorrowedBookTracking.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deleteCount == 1) {
      return true;
    }
    return false;
  }
}

module.exports = BorrowedBookTracking;