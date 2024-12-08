import Joi from "joi";
//kiem tra xem signin signup da dung form chua
export const singUpValidator = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Tên là bắt buộc.',
        'string.empty': 'Tên không được để trống.',
    }),
    birthday: Joi.required().messages({
        'any.required': 'Ngày sinh là bắt buộc.',
    }),
    user__name: Joi.string().required().min(6).max(255).messages({
        'any.required': 'Tên đăng nhập là bắt buộc.',
        'string.min': 'Tên đăng nhập phải có ít nhất 6 ký tự.',
        'string.max': 'Tên đăng nhập không được vượt quá 255 ký tự.',
    }),
    phone__number: Joi.string().required().pattern(/^[0-9]{10,12}$/).messages({
        'any.required': 'Số điện thoại là bắt buộc.',
        'string.pattern.base': 'Số điện thoại không hợp lệ. Phải có từ 10 đến 12 chữ số.',
    }),
    password: Joi.string().required().min(6).max(255).messages({
        'any.required': 'Mật khẩu là bắt buộc.',
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
        'string.max': 'Mật khẩu không được vượt quá 255 ký tự.',
    }),
    rePassword: Joi.string().required().min(6).max(255)
        .valid(Joi.ref("password")).messages({
        'any.required': 'Xác nhận mật khẩu là bắt buộc.',
        'any.only': 'Mật khẩu xác nhận không khớp.',
        'string.min': 'Mật khẩu xác nhận phải có ít nhất 6 ký tự.',
        'string.max': 'Mật khẩu xác nhận không được vượt quá 255 ký tự.',
    }),
    gmail: Joi.string().email().messages({
        'string.email': 'Email không hợp lệ.',
    }),
    sex: Joi.required().messages({
        'any.required': 'Giới tính là bắt buộc.',
    })
});

export const signInValidator = Joi.object({
    user__name: Joi.string().required().min(6).max(255).messages({
        'any.required': 'Bạn chưa điền tên đăng nhập',
        'string.min': 'Tên đăng nhập phải có ít nhất 6 ký tự.',
        'string.max': 'Tên đăng nhập không được vượt quá 255 ký tự.',
    }),
    password: Joi.string().required().min(6).max(255).messages({
        'any.required': 'Bạn chưa điền mật khẩu',
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.',
        'string.max': 'Mật khẩu không được vượt quá 255 ký tự.',
    }),
})