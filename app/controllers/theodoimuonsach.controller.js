const { query } = require("express");
const BorrowedBookTracking = require("../services/theodoimuonsach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { ObjectId } = require("mongodb");
const ReaderService = require("../services/docgia.service");
const BookService = require("../services/sach.service");

exports.create = async (req, res, next) => {
  console.log(req.body);

  if (
    !req.body?.madocgia ||
    !req.body?.masach ||
    !req.body?.ngaymuon ||
    !req.body?.soquyen
  ) {
    return next(
      new ApiError(
        400,
        "Thiếu thông tin cần thiết (mã sách, mã độc giả, ngày mượn, số lượng sách)"
      )
    );
  }
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const bookService = new BookService(MongoDB.client);
    // Kiểm tra mã sách
    const book = await bookService.findByMasach(req.body.masach);
    if (!book) {
      return next(
        new ApiError(404, "Không tìm thấy sách với mã được cung cấp")
      );
    }
    if (book.soquyen < req.body.soquyen) {
      return next(new ApiError(400, "Không đủ số lượng sách để mượn"));
    }

    // Giảm số lượng sách
    await bookService.update(book._id, {
      soquyen: book.soquyen - req.body.soquyen,
    });

    const document = await borrowedBookTrackingService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi thêm mới 1 lượt mượn sách"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const { searchKey, status } = req.query;
    if (searchKey) {
      documents = await borrowedBookTrackingService.findBySearchKey(searchKey);
    } else if (status) {
      documents = await borrowedBookTrackingService.findByStatus(status);
    } else {
      documents = await borrowedBookTrackingService.find({});
    }
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Có lỗi khi truy cập nhiều quản lý mượn sách")
    );
  }
};

exports.findByMaSach = async (req, res, next) => {
  if (!req.params?.masach) {
    return next(new ApiError(400, "Thieu thong tin ma sach"));
  }
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const documents = await borrowedBookTrackingService.find({
      masach: req.params.masach,
    });

    return res.send(documents ?? []);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi tìm sách đã mượn theo mã sách"));
  }
};

exports.findOne = async (req, res, next) => {
  if (!req.query?.madocgia || !req.query?.masach || !req.query?.ngaymuon) {
    return next(
      new ApiError(400, "Thieu thong tin cua (madocgia, masach, ngaymuon)")
    );
  }
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const { madocgia, masach, ngaymuon } = req.query;
    const document = await borrowedBookTrackingService.findOne(
      madocgia,
      masach,
      ngaymuon
    );
    if (!document) {
      return next(new ApiError(400, "Không tìm thấy"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi tìm kiếm 1 quản lý mượn"));
  }
};

exports.delete = async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id))
    return next(new ApiError("400", "Mã không hợp lệ"));
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const result = await borrowedBookTrackingService.deleteOne(req.params.id);
    if (result) {
      return res.send({ message: "Xóa thành công" });
    }
    return res.send({
      errorMessage: "Xóa thất bại, đã có lỗi xảy ra ",
    });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra ở máy chủ"));
  }
};

exports.deleteAll = (req, res) => {
  res.send({ message: "Xoa tat ca theo doi muon sach" });
};

exports.findBorrowedOfReader = async (req, res, next) => {
  if (!req.query?.madocgia || !req.query?.masach) {
    return next(new ApiError(400, "Thiếu thông tin"));
  }
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const documents = await borrowedBookTrackingService.find({
      $and: [{ madocgia: req.query.madocgia }, { masach: req.query.masach }],
    });
    return res.send(documents || []);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi"));
  }
};

exports.update = async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, "Mã không hợp lệ"));
  }

  try {
    // console.log("Cap nhat " + req.body.trangthai);
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );
    const document = await borrowedBookTrackingService.update(
      req.params.id,
      req.body
    );

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy lượt mượn phù hợp"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi cập nhật 1 lượt mượn sách"));
  }
};

exports.getHistoryOfReader = async (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, "Mã id không hợp lệ"));
  }
  try {
    const borrowedBookTrackingService = new BorrowedBookTracking(
      MongoDB.client
    );

    const readerService = new ReaderService(MongoDB.client);
    const docgia = await readerService.findById(req.params.id);
    if (!docgia)
      return next(new ApiError(404, "Không tìm thấy thong tin độc giả"));

    const documents = await borrowedBookTrackingService.getHistory(
      docgia.madocgia
    );
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Có lỗi xảy ra ở máy chủ khi lấy ds lịch sử thuê sách")
    );
  }
};