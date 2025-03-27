const { ObjectId } = require("mongodb");

class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("nhanvien");
  }
  extractStaffData(payload) {
    const staff = {
      msnv: payload.msnv ? payload.msnv.toUpperCase() : undefined,
      hotennv: payload.hotennv,
      password: payload.password,
      chucvu: payload.chucvu,
      diachi: payload.diachi,
      sodienthoai: payload.sodienthoai,
    };

    Object.keys(staff).forEach(
      (key) => staff[key] === undefined && delete staff[key]
    );
    return staff;
  }
  async create(payload) {
    const staff = this.extractStaffData(payload);

    const isExist = await this.find({ msnv: staff.msnv });

    if (isExist.length > 0) {
      return { errorMessage: "Mã nhân viên đã tồn tại" };
    }

    const document = await this.Staff.findOneAndUpdate(
      {
        msnv: staff.msnv,
      },
      { $set: staff },
      {
        upsert: true,
        returnDocument: "after",
      }
    );
    return document;
  }
  async update(id, payload) {
    const staffUpdate = this.extractStaffData(payload);
    console.log(staffUpdate);

    const document = await this.Staff.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: staffUpdate },
      { returnDocument: "after" }
    );

    return document;
  }

  async changePassword(id, oldPass, newPass) {
    const staff = await this.findById(id);
    if (staff) {
      const isMatchPassword = bcryot;
    } else {
      return { errorMessage: "Không tìm thấy nhân viên này" };
    }
  }

  async find(filter) {
    const result = await this.Staff.find(filter);
    return await result.toArray();
  }
  async findByName(name) {
    return await this.find({
      hotennv: { $regex: new RegExp(name, "i") },
    });
  }
  async findById(id) {
    return await this.Staff.findOne({
      _id: new ObjectId(id),
    });
  }

  async findByMSNV(msnv) {
    return await this.Staff.findOne({
      msnv: msnv,
    });
  }

  async deleteAll() {
    const deletedCount = await this.Staff.deleteMany({});
    return deletedCount;
  }
  async deleteOne(id) {
    const result = await this.Staff.findOneAndDelete({
      _id: new ObjectId(id),
    });
    return result;
  }
}

module.exports = StaffService;