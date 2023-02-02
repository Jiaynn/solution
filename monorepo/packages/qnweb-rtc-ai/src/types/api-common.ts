export interface QNKeyWordsType {
  /**
   * 命中的关键词KeyWords。返回不多于10个。
   */
  keyWords: string;
  /**
   * 命中的关键词KeyWords相应的分数。分数越高表示和关键词越相似，对应kws中的分数。
   */
  keyWordsScore: number;
  /**
   * 关键词结束时间, 单位毫秒
   */
  endTimestamp: number;
  /**
   * 关键词开始时间, 单位毫秒
   */
  beginTimestamp: number;
}

export interface QNPiece {
  /**
   * 转写分解结果。
   */
  transcribedText: string;
  /**
   * 分解结束时间(音频开始时间为0), 单位毫秒
   */
  endTimestamp: number;
  /**
   * 分解开始时间(音频开始时间为0), 单位毫秒
   */
  beginTimestamp: number;
}

export interface QNStreamingTranscription {
  /**
   * 转写结果
   */
  transcribedText: string;
  /**
   * 句子的开始时间, 单位毫秒
   */
  beginTimestamp: number;
  /**
   * 句子的结束时间, 单位毫秒
   */
  endTimestamp: number;
  /**
   * 转写结果中包含KeyWords内容
   */
  keyWordsType: QNKeyWordsType[];
  /**
   * 转写结果的分解（只对final状态结果有效，返回每个字及标点的详细信息）
   */
  piece: QNPiece[];
}

export interface QNFaceLocation {
  /**
   * 人脸区域离左边界的距离
   */
  left?: number;
  /**
   * 人脸区域离上边界的距离
   */
  top?: number;
  /**
   * 人脸区域的宽度
   */
  width?: number;
  /**
   * 人脸区域的高度
   */
  height?: number;
  /**
   * 人脸框相对于竖直方向的顺时针旋转角，[-180,180]
   */
  rotate?: number;
}

export interface QNFaceAngle {
  /**
   * 三维旋转之左右旋转角[-90(左), 90(右)]
   */
  yaw?: number;
  /**
   * 三维旋转之俯仰角度[-90(上), 90(下)]
   */
  pitch?: number;
  /**
   * 平面内旋转角[-180(逆时针), 180(顺时针)]
   */
  roll?: number;
}

export interface QNFaces {
  /**
   * 人脸图片的唯一标识
   */
  face_token?: string;
  /**
   * 人脸在图片中的位置
   */
  location?: QNFaceLocation;
  /**
   * 检测人脸框的人脸图片base64值
   */
  corp_image_base64?: string;
  /**
   * 人脸置信度，范围【0~1】，代表这是一张人脸的概率，0最小、1最大。其中返回0或1时，数据类型为Integer
   */
  face_probability?: number;
  /**
   * 人脸旋转角度参数
   */
  angle?: QNFaceAngle;
  /**
   * 年龄 ，当face_field包含age时返回
   */
  age?: number;
  /**
   * 表情，当 face_field包含expression时返回
   */
  expression?: {
    /**
     * none:不笑；smile:微笑；laugh:大笑
     */
    type?: string;
    /**
     * 表情置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 脸型，当face_field包含face_shape时返回
   */
  face_shape?: {
    /**
     * square: 正方形 triangle:三角形 oval: 椭圆 heart: 心形 round: 圆形
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 性别，face_field包含gender时返回
   */
  gender?: {
    /**
     * male:男性 female:女性
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 是否带眼镜，face_field包含glasses时返回
   */
  glasses?: {
    /**
     * none:无眼镜，common:普通眼镜，sun:墨镜
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 双眼状态（睁开/闭合） face_field包含eye_status时返回
   */
  eye_status?: {
    /**
     * 左眼状态 [0,1]取值，越接近0闭合的可能性越大
     */
    left_eye?: number;
    /**
     * 右眼状态 [0,1]取值，越接近0闭合的可能性越大
     */
    right_eye?: number;
  };
  /**
   * 情绪 face_field包含emotion时返回
   */
  emotion?: {
    /**
     * angry:愤怒 disgust:厌恶 fear:恐惧 happy:高兴 sad:伤心 surprise:惊讶 neutral:无表情 pouty: 撅嘴 grimace:鬼脸
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 真实人脸/卡通人脸 face_field包含face_type时返回
   */
  face_type?: {
    /**
     * human: 真实人脸 cartoon: 卡通人脸
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 口罩识别 face_field包含mask时返回
   */
  mask?: {
    /**
     * 没戴口罩/戴口罩 取值0或1 0代表没戴口罩 1 代表戴口罩
     */
    type?: string;
    /**
     * 置信度，范围【0~1】，0最小、1最大。
     */
    probability?: number;
  };
  /**
   * 4个关键点位置，左眼中心、右眼中心、鼻尖、嘴中心。face_field包含landmark时返回
   */
  landmark?: Array<{
    x?: number;
    y?: number
  }>;
  /**
   * 72个特征点位置 face_field包含landmark时返回
   */
  landmark72?: Array<{
    x?: number;
    y?: number
  }>;
  /**
   * 150个特征点位置 face_field包含landmark150时返回
   */
  landmark150?: Array<{
    x?: number;
    y?: number
  }>;
  /**
   * 人脸质量信息。face_field包含quality时返回
   */
  quality?: QNFaceQuality;
  /**
   * 判断图片是否为合成图
   */
  spoofing?: number;
}

export interface QNDetectResult {
  /**
   * 检测到的图片中的人脸数量
   */
  face_num?: number;
  /**
   * 人脸信息列表，具体包含的参数参考下面的列表。
   */
  face_list?: QNFaces[];
}

export interface QNCompareResult {
  /**
   * 人脸相似度得分，推荐阈值80分
   */
  score?: number;
  /**
   * 人脸信息列表
   */
  face_list?: Array<{
    /**
     * 人脸的唯一标志
     */
    face_token?: string;
  }>;
}

export interface QNThresholds {
  /**
   * 万分之一误拒率的阈值
   */
  'frr_1e-4'?: number;
  /**
   * 千分之一误拒率的阈值
   */
  'frr_1e-3'?: number;
  /**
   * 百分之一误拒率的阈值
   */
  'frr_1e-2'?: number;
}

export interface QNFaceQualityOcclusion {
  /**
   * 左眼遮挡比例，[0-1] ，1表示完全遮挡
   */
  left_eye?: number;
  /**
   * 右眼遮挡比例，[0-1] ，1表示完全遮挡
   */
  right_eye?: number;
  /**
   * 鼻子遮挡比例，[0-1] ，1表示完全遮挡
   */
  nose?: number;
  /**
   * 嘴遮挡比例，[0-1] ，1表示完全遮挡
   */
  mouth?: number;
  /**
   * 左脸颊遮挡比例，[0-1] ，1表示完全遮挡
   */
  left_cheek?: number;
  /**
   * 右脸颊遮挡比例，[0-1] ，1表示完全遮挡
   */
  right_cheek?: number;
  /**
   * 下巴遮挡比例，[0-1] ，1表示完全遮挡
   */
  chin?: number;
}

export interface QNFaceQuality {
  /**
   * 人脸各部分遮挡的概率，范围[0~1]，0表示完整，1表示不完整
   */
  occlusion?: QNFaceQualityOcclusion;
  /**
   * 人脸模糊程度，范围[0~1]，0表示清晰，1表示模糊
   */
  blur?: number;
  /**
   * 取值范围在[0~255], 表示脸部区域的光照程度 越大表示光照越好
   */
  illumination?: number;
  /**
   * 人脸完整度，0或1, 0为人脸溢出图像边界，1为人脸都在图像边界内
   */
  completeness?: number;
}

export interface QNImage {
  /**
   * base64编码后的图片信息
   */
  pic?: string;
  /**
   * 此图片的活体分数，范围[0,1]
   */
  liveness_score?: number;
  /**
   * 人脸图片的唯一标识
   */
  face_token?: string;
  /**
   * 此图片的合成图分数，范围[0,1]
   */
  spoofing?: number;
  /**
   * 人脸质量信息。face_field包含quality时返回
   */
  quality?: QNFaceQuality;
}

export interface QNVerifyResult {
  /**
   * 活体检测的总体打分 范围[0,1]，分数越高则活体的概率越大
   */
  score?: number;
  /**
   * 返回的1-8张图片中合成图检测得分的最大值 范围[0,1]，分数越高则概率越大
   */
  maxspoofing?: number;
  /**
   * 返回的1-8张图片中合成图检测得分的中位数 范围[0,1]，分数越高则概率越大
   */
  spoofing_score?: number;
  /**
   * 阈值 按活体检测分数>阈值来判定活体检测是否通过(阈值视产品需求选择其中一个)
   */
  thresholds?: QNThresholds;
  /**
   * 动作识别结果 pass代表动作验证通过，fail代表动作验证未通过
   */
  action_verify?: string;
  /**
   * 图片信息
   */
  best_image?: QNImage;
  /**
   * 返回1-8张抽取出来的图片信息
   */
  pic_list?: QNImage[];
}
