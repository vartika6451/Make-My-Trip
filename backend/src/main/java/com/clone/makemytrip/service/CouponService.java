package com.clone.makemytrip.service;

import com.clone.makemytrip.model.Coupon;
import com.clone.makemytrip.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Coupon validateCoupon(String code) {
        return couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired coupon code"));
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon saveCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
