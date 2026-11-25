import { Request, Response, NextFunction } from "express";
import {
  getOrderForFrontendByToken,
  insertPaymentProof,
} from "../services/order.service";
import {
  createUploadIntent,
  finalizeUploadService,
} from "../services/upload-image.service";
import { ApiResponse, ReturnSignedUploadType } from "@chi/shared-types";
import { ALLOWED_IMAGE_TYPES, Errors } from "@chi/shared-utils";

export async function fetchOrderByToken(
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) {
  try {
    const result = await getOrderForFrontendByToken(req.params.token as string);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function createPaymentProof(
  req: Request,
  res: Response<ApiResponse<any>>,
  next: NextFunction
) {
  try {
    const result = await insertPaymentProof(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function sendUploadIntent(
  req: Request,
  res: Response<ApiResponse<ReturnSignedUploadType>>,
  next: NextFunction
) {
  try {
    const { fileType } = req.body;

    if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
      throw Errors.INVALID_INPUT;
    }

    const data = await createUploadIntent(fileType);

    res.status(201).json({
      success: true,
      code: "OK",
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function finalizeUpload(
  req: Request,
  res: Response<ApiResponse<Pick<ReturnSignedUploadType, "url">>>,
  next: NextFunction
) {
  try {
    const data = await finalizeUploadService(req.body.key);

    res.status(201).json({
      success: true,
      code: "OK",
      data,
    });
  } catch (err) {
    next(err);
  }
}
