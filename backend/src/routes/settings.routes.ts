import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const SETTINGS_FILE = path.join(__dirname, '../../delivery_settings.json');

export interface DeliverySettings {
  insideDhaka: number;
  outsideDhaka: number;
  minOrderAmount: number;
  expressSurge: number;
  notice: string;
}

const defaultSettings: DeliverySettings = {
  insideDhaka: 80,
  outsideDhaka: 120,
  minOrderAmount: 0,
  expressSurge: 0,
  notice: 'Standard delivery: Inside Dhaka ৳80, Outside Dhaka ৳120.',
};

export const getStoredDeliverySettings = (): DeliverySettings => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading delivery settings file:', err);
  }
  return defaultSettings;
};

export const saveStoredDeliverySettings = (settings: DeliverySettings) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving delivery settings file:', err);
  }
};

// Get Public Delivery Settings
router.get('/delivery', (req, res) => {
  const settings = getStoredDeliverySettings();
  return res.json({ settings });
});

// Update Delivery Settings (Admin)
router.put('/admin/delivery', (req, res) => {
  try {
    const { insideDhaka, outsideDhaka, minOrderAmount, expressSurge, notice } = req.body;

    const current = getStoredDeliverySettings();
    const updated: DeliverySettings = {
      insideDhaka: insideDhaka !== undefined ? Math.max(0, parseFloat(insideDhaka)) : current.insideDhaka,
      outsideDhaka: outsideDhaka !== undefined ? Math.max(0, parseFloat(outsideDhaka)) : current.outsideDhaka,
      minOrderAmount: minOrderAmount !== undefined ? Math.max(0, parseFloat(minOrderAmount)) : current.minOrderAmount,
      expressSurge: expressSurge !== undefined ? Math.max(0, parseFloat(expressSurge)) : current.expressSurge,
      notice: notice !== undefined ? notice.trim() : current.notice,
    };

    saveStoredDeliverySettings(updated);
    return res.json({ message: 'Delivery charges updated successfully', settings: updated });
  } catch (error) {
    console.error('Update delivery settings error:', error);
    return res.status(500).json({ message: 'Failed to update delivery settings' });
  }
});

export default router;
