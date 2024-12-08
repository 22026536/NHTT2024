import Joi from "joi";

// Khai báo validator cho signIn
const signInValidator = Joi.object({
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
});

export default signInValidator;
