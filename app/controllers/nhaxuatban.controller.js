const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");
const PublisherService = require("../services/nhaxuatban.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (!req.body?.manxb) {
    return next(new ApiError(400, "Mã nhà xuất bản là bắt buộc"));
  }
  try {
    const publisherService = new PublisherService(MongoDB.client);

    const document = await publisherService.create(req.body);

    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi thêm mới một nhà xản suất"));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const { name } = req.query;

    if (name) {
      documents = await publisherService.findByName(name);
    } else {
      documents = await publisherService.find({});
    }

    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "Co loi trong qua trinh tim kiem cac nha xuat ban")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.findById(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản phù hợp"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Có lỗi trong quá trình tìm nhà xuất bản với ID: " + req.params.id
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  if (!req.params.id || !ObjectId.isValid(req.params.id)) {
    return next(new ApiError(400, "Mã không hợp lệ"));
  }

  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.deleteOne(req.params.id);

    if (!document || document.errorMessage) {
      if (document.errorMessage) {
        return res.send({
          errorMessage:
            "Không thể xóa do nhà xuất bản này đang có sách liên quan",
        });
      }
      return next(new ApiError(400, "Không tìm thấy nhà xuất bản"));
    }
    return res.send({ message: "Xóa thành công nhà xuất bản" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Lỗi xảy ra khi xóa một nhà xuất bản - mã nhà xuất bản: ${req.params.id}`
      )
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const deleteCount = await publisherService.deleteAll();
    return res.send({
      message: `${deleteCount} publisher was deleted successfully`,
    });
  } catch (error) {
    return next(new ApiError(500, "An error corrur when delete publisher"));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được rỗng"));
  }
  if (!ObjectId.isValid(req.params.id)) {
    return next(new ApiError(404, "Mã không hợp lệ"));
  }
  try {
    const publisherService = new PublisherService(MongoDB.client);
    const document = await publisherService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản để cập nhật"));
    }
    return res.send({ message: "Cập nhật thành công nhà xuất bản" });
  } catch (error) {
    return next(
      new ApiError(500, `Có lỗi khi cập nhật nhà xuất bản ${req.params.id} `)
    );
  }
};