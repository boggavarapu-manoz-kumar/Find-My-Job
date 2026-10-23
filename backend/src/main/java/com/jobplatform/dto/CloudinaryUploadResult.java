package com.jobplatform.dto;

public class CloudinaryUploadResult {

    private String publicId;
    private String assetId;
    private String secureUrl;
    private String format;
    private int width;
    private int height;
    private long bytes;

    public CloudinaryUploadResult() {}

    public CloudinaryUploadResult(String publicId, String assetId, String secureUrl, String format, int width, int height, long bytes) {
        this.publicId = publicId;
        this.assetId = assetId;
        this.secureUrl = secureUrl;
        this.format = format;
        this.width = width;
        this.height = height;
        this.bytes = bytes;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public String getSecureUrl() {
        return secureUrl;
    }

    public void setSecureUrl(String secureUrl) {
        this.secureUrl = secureUrl;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int height() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public long getBytes() {
        return bytes;
    }

    public void setBytes(long bytes) {
        this.bytes = bytes;
    }
}
