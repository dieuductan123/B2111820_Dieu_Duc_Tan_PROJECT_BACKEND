const ApiError = require("../api-error");
const StaffService = require("../services/nhanvien.service");
const MongoDB = require("../utils/mongodb.util");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

exports.create = async (req, res, next) => {
  if (!req.body?.msnv) {
    return next(new ApiError(400, "Mã số nhân viên là bắt buộc"));
  }
  try {
    const staffService = new StaffService(MongoDB.client);
    req.body.password = await bcrypt.hash(req.body.password, 6);
    const document = await staffService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi thêm mới một nhân viên"));
  }
};

exports.changePassword = async (req, res, next) => {
  if (!req.body?.oldPass || !req.body?.newPass || !req.params.id) {
    return next(new ApiError(400, "Thiếu thông tin đổi mật khẩu"));
  }
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, "Mã số không hợp lệ"));
  }
  try {
    const staffService = new StaffService(MongoDB.client);

    const staff = await staffService.findById(req.params.id);
    if (!staff) {
      return next(new ApiError(404, "Không có nhân viên này"));
    }

    const isMatchPassword = await bcrypt.compare(
      req.body.oldPass,
      staff.password
    );

    if (!isMatchPassword) {
      return res.send({ errorMessage: "Mật khẩu cũ không chính xác" });
    }

    const newPassHash = await bcrypt.hash(req.body.newPass, 6);

    const document = await staffService.update(req.params.id, {
      password: newPassHash,
    });
    console.log("Đổi mật khẩu thành công");
    console.log(document);

    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi đổi mật khẩu"));
  }
};

exports.findOne = async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, "Mã nhân viên không hợp lệ"));
  }
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.findById(req.params.id);
    if (!document) {
      return next(
        new ApiError(404, `Không tìm thấy nhân viên ${req.params.id}`)
      );
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi tìm nhân viên ${req.params.id} `));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const staffService = new StaffService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await staffService.findByName(name);
    } else {
      documents = await staffService.find({});
    }
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi tím kiếm nhân viên"));
  }
};

exports.update = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.update(req.params.id, req.body);
    if (!document) {
      return next(
        new ApiError(404, `Không tìm thấy mã nhân viên ${req.params.id}`)
      );
    }
    return res.send({ message: "Cập nhật thành công nhân viên" });
  } catch (error) {
    return next(
      new ApiError(500, ` Có lỗi khi cập nhật nhân viên ${req.params.id}`)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const staffService = new StaffService(MongoDB.client);
    const result = await staffService.deleteAll();
    return res.send(`${result.deletedCount} nhân viên đã bị xóa`);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi xóa tất cả nhân viên"));
  }
};

exports.delete = async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, "Mã nhân viên không hợp lệ"));
  }

  try {
    const staffService = new StaffService(MongoDB.client);
    const document = await staffService.deleteOne(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy mã nhân viên"));
    }

    return res.send({ message: `Xóa thành công nhân viên ${req.params.id}` });
  } catch (error) {
    return next(
      new ApiError(500, `Có lỗi xảy ra khi xóa nhân viên ${req.params.id}`)
    );
  }
};

exports.login = async (req, res, next) => {
  if (!req.body?.msNV || !req.body?.matKhau) {
    return next(new ApiError(400, "Thông tin đăng nhập thiếu"));
  }
  try {
    const staffService = new StaffService(MongoDB.client);
    const { msNV, matKhau } = req.body;

    const user = await staffService.findByMSNV(msNV);

    if (!user) {
      console.log("Thông tin đăng nhập sai sai ten dang nhap");
      return res.json({ message: "Thông tin đăng nhập sai" });
    }

    const isPasswordCorrect = await bcrypt.compare(matKhau, user.password);

    if (!isPasswordCorrect) {
      return res.json({ message: "Thông tin đăng nhập sai" });
    }

    const user_info = { ...user, password: "******" };
    console.log("Đăng nhập thành công" + user_info);

    const token = jwt.sign({ id: user.msnv, user: user }, "your_jwt_secret", {
      expiresIn: "30m",
    });
    console.log(token);

    return res.json({
      success: "true",
      token,
      user: user_info,
    });
  } catch (error) {
    return next(new ApiError(404, "Lỗi khi đăng nhập"));
  }
};