import Company from "../models/company.js";

// ✅ Register Company
export const registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, phone, address, website, description, industry, size, establishedYear, logo } = req.body;

    const existing = await Company.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Company already registered with this email" });
    }

    const company = await Company.create({
      companyName,
      email,
      password,
      phone,
      address,
      website,
      description,
      industry,
      size,
      establishedYear,
      logo,
    });

    const accessToken = company.generateAccessToken();
    const refreshToken = company.generateRefreshToken();

    company.refreshToken = refreshToken;
    await company.save({ validateBeforeSave: false });

    return res.status(201).json({
      success: true,
      message: "Company registered successfully",
      accessToken,
      refreshToken,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Login Company
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const isMatch = await company.isPasswordCorrect(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const accessToken = company.generateAccessToken();
    const refreshToken = company.generateRefreshToken();

    company.refreshToken = refreshToken;
    await company.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Logout Company
export const logoutCompany = async (req, res) => {
  try {
    const { companyId } = req.body;
    await Company.findByIdAndUpdate(companyId, { refreshToken: "" });
    res.status(200).json({ success: true, message: "Company logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ✅ Get single company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id).select("-password -refreshToken");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching company",
      error: error.message,
    });
  }
};

// ✅ Update company by ID
export const updateCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "companyName",
      "email",
      "phone",
      "address",
      "website",
      "description",
      "industry",
      "size",
      "plan",
      "establishedYear",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedCompany = await Company.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
      select: "-password -refreshToken",
    });

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({
      success: false,
      message: "Error updating company",
      error: error.message,
    });
  }
};

