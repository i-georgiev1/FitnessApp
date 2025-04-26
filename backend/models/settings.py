from datetime import datetime
from sqlalchemy import String, DateTime, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from database import db

class SystemSettings(db.Model):
    __tablename__ = 'system_settings'
    
    setting_id: Mapped[int] = mapped_column(primary_key=True)
    site_name: Mapped[str] = mapped_column(String(100), nullable=False, default="FitnessApp")
    site_description: Mapped[str] = mapped_column(String(500), nullable=True)
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_registrations: Mapped[bool] = mapped_column(Boolean, default=True)
    max_users_per_trainer: Mapped[int] = mapped_column(Integer, default=10)
    default_user_quota: Mapped[int] = mapped_column(Integer, default=5)
    email_notifications: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_backup: Mapped[bool] = mapped_column(Boolean, default=True)
    backup_frequency: Mapped[str] = mapped_column(String(20), default='daily')
    analytics_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by: Mapped[int] = mapped_column(Integer, nullable=True)  # user_id of the admin who last updated

    def __repr__(self):
        return f'<SystemSettings {self.setting_id}>'

    def to_dict(self):
        return {
            'siteName': self.site_name,
            'siteDescription': self.site_description,
            'maintenanceMode': self.maintenance_mode,
            'allowNewRegistrations': self.allow_registrations,
            'maxUsersPerTrainer': self.max_users_per_trainer,
            'defaultUserQuota': self.default_user_quota,
            'emailNotifications': self.email_notifications,
            'autoBackup': self.auto_backup,
            'backupFrequency': self.backup_frequency,
            'analyticsEnabled': self.analytics_enabled,
            'updatedAt': self.updated_at.isoformat(),
            'updatedBy': self.updated_by
        } 