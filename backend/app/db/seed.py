import logging
from sqlalchemy.orm import Session
from app.models.place import Place

logger = logging.getLogger(__name__)

# Same destinations that used to be hardcoded in the frontend (Explore grid +
# Bucket List demo items), now backed by real rows so they can be searched,
# filtered, and saved to a bucket list.
SEED_PLACES = [
    {"name": "Munnar Tea Gardens", "category": "Nature", "state": "Kerala", "country": "India",
     "latitude": 10.0889, "longitude": 77.0595,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuB2B8pWEkB40yyTXXHiohSe4-AiYXkSbp3ZeJgnxybvs43KYsZPn48X8LX2esgj7KFIg_R2WqXuRCA9XiVuyBNH-Erx_JtrikGzrfybs6veURyoWNmTVriZuQ0GXAQeH6eWFmDO-ZJORUAYlOMHPebVey8_tanCAsSXxc4jWAA9zOJN179EX1vFVGMaMPqH8uTgW45FH3AdoMqsE0jWe0IZYZIKEO6-U6NjQ7B8Y-oxijSI95kriv1V"]},
    {"name": "Jaisalmer Fort", "category": "Heritage", "state": "Rajasthan", "country": "India",
     "latitude": 26.9124, "longitude": 70.9090,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuCc9VMlfpJtNggVnlfIvUQoN1gzMrNH2t_XXA6YGmGiN7CmymDRGFFY7-OlBdYEohXdH3gLDDVo1s2IVDxK0r4hmNsLFqj9Qxo05hyBIizimVtJxlOFKLWJMEcBUvi4GsAYeCibti4ok6xfLhaQE3ImLbb7QoZ56tJSpBypYKfdk89BOk0F6ikuoxgOR02wwecDt30kfkBBBzVabJoQe4-rMs43xr7lfds4mtqy-jlSOebAKY99pKtS"]},
    {"name": "Radhanagar Beach", "category": "Coastal", "state": "Andaman", "country": "India",
     "latitude": 11.9820, "longitude": 92.9609,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuDdz0jNkfgaymgceQlaYNk4GA5s7Sjpw18WnchlJXE_tJ2szRFZlyVrz_dDbFolK7ZkfHUTQSLay6fG1VzNaWXnpkK5GweTW9EfrqFIuNeX6JmFjT7nAQ-kPgQ7AoKsqJkZ7OKKS4cdkgq4l3SGZzJh8Pik-PlbkTYjbW5WmVdBJj3MMdVEAldar-zMnn1WxM6Gn7E4lx1Dn3P0kkB4MyqczWUc5cPNcuLu7-ZECTYnPkE3cBgoD_7s"]},
    {"name": "Spiti Valley", "category": "Adventure", "state": "Himachal", "country": "India",
     "latitude": 32.2464, "longitude": 78.0349,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuCbad8_BDEpgyQt69XtbYmmp9amuiDdh5MvznzdPC-ItxOItYX7_f-dZN9_6eY8ahx8OP0Wi3YpMfotMZNQSeh8Kqd2xatbY2nawHkDeA6NX4iSeMBS9SQjcQiCLgkZ2jkupHCSmqYbBDqeTIkVYOzXeAcd_82fJ1w6icGnU03UTr2TfCCGMtQ7UvvkAT2AnQCEYLZE0ZvAzlPRscXiVIn1HesFPM44-LMNgBM_Yl7qKbXQBE_sauf7"]},
    {"name": "Pondicherry", "category": "Urban", "state": "Tamil Nadu", "country": "India",
     "latitude": 11.9416, "longitude": 79.8083,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuCwB_BBoug_NE2avkWHWXubcDk-QP9t8yKvda31VJSvdXPFon-iZ69V2Qm9uBZcQGtfuL4e3_1SxgOKflTPYKPcKd_Ew9gKh6mI8zulavROUKXzkyJ4KDxfxk6GwcYoUmeu69cseaYK7ZGFLXBs5OFmlgA5tg1xW7tLFpgT_rXhudIS4ClCQxq8d2RmxtijRH5Qmmfgzgj-wodrqJBOLYPFICwfo8zasNEs5pFywAftzabk6e2B5aMg"]},
    {"name": "Valley of Flowers", "category": "Nature", "state": "Uttarakhand", "country": "India",
     "latitude": 30.7280, "longitude": 79.6050,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuBsomkP2rDarf2KzApFgzh-7dVwztMAwWnHOhJGWO2BtjrR7-69YNDiIKfSZOdLfjVajdaNmr2AomDz5h6EkcyMh-UyDySaqoE8RWNPJgFiaHMdp7MSfWqGZwh09lymygxH-w5OYCmwrvftOOQVEgzv9fn1AZj75NFG9Qw_JU-kFExd6xfTQfT7W28n52Va4wXnh32vJuPXj_-J88fv2AyRnburB7ZNU9t5LglNUmXShLntmrx76TxH"]},
    {"name": "Devkund Waterfall", "category": "Nature", "state": "Maharashtra", "country": "India",
     "latitude": 18.2153, "longitude": 73.6357,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuCyhiYF-a2eql2Iz3Ve-cfB5kze6zpD25S-DlZ5gYt3kPIU9DlVtPerZcxNz65tTeg-dKzpbE59rE9Qr6Jpw60himI2h5YUMHSqJWNCVSOYjg7yPYtlUurAgORyfyfteZk-w8ENpPcTI8eAyplm4CHACIGq30nzO_3RUROa5eL5oekgS-NEZjtlyWiD1wquxr-DP_PnnQHr4vng1ayshzmBmgmyIVswfylj-6EJtN0ce92AAass_NgO"]},
    {"name": "Sandhan Valley", "category": "Adventure", "state": "Western Ghats", "country": "India",
     "latitude": 19.6465, "longitude": 73.7515,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuBZlug7NGGsiRYbGnzRfhnO_cxcWsR4qvHHNoaF40_Kfj5j1fWPntcwTRRALcbHp0fNf7ABM3Zz9ladIHSwn4yH2JmEsFEkpin3wS2G4WSznsQrMWMH5cu_CEXLUw1DWgzJGpyHYg9EEKrJzbhxtrjIMUOE_1KLOEftLmBdoUvKfT3Pae5Vw56YStW2j27SZnifT347jeIjQCApzToathCT9DuKB_rk2M_xObt0MM-WFtBOf7R-SEd5"]},
    {"name": "Om Beach", "category": "Coastal", "state": "Gokarna", "country": "India",
     "latitude": 14.4801, "longitude": 74.3049,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuBEgeDSKa3nLCLBFeN13C1O8QW34UUWAZmJ6p0ytZmVY_nVCyhwlqWZ_U2WJeJsWDXr_9bfNrI1EFQydQpBT79Q6cmnU-3EwQYB8cqSFnJ2jIEQcuoDqCjS6DK49Y5CwSlyLnkqzR9RkTZdJDfgz1GtNC30Fvp_zB-oT7FE34m67uBvnvfh86JnYrHDqGJYOp40vLiSaW7WTB_kKTXteqa0rK4EYduprS8Ueg13mgg-KwaPlIDLe-_h"]},
    {"name": "Harishchandragad", "category": "Heritage", "state": "Maharashtra", "country": "India",
     "latitude": 19.3860, "longitude": 73.7800,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuCc9VMlfpJtNggVnlfIvUQoN1gzMrNH2t_XXA6YGmGiN7CmymDRGFFY7-OlBdYEohXdH3gLDDVo1s2IVDxK0r4hmNsLFqj9Qxo05hyBIizimVtJxlOFKLWJMEcBUvi4GsAYeCibti4ok6xfLhaQE3ImLbb7QoZ56tJSpBypYKfdk89BOk0F6ikuoxgOR02wwecDt30kfkBBBzVabJoQe4-rMs43xr7lfds4mtqy-jlSOebAKY99pKtS"]},
    {"name": "Butterfly Beach", "category": "Coastal", "state": "Goa", "country": "India",
     "latitude": 15.0940, "longitude": 73.9880,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuDdz0jNkfgaymgceQlaYNk4GA5s7Sjpw18WnchlJXE_tJ2szRFZlyVrz_dDbFolK7ZkfHUTQSLay6fG1VzNaWXnpkK5GweTW9EfrqFIuNeX6JmFjT7nAQ-kPgQ7AoKsqJkZ7OKKS4cdkgq4l3SGZzJh8Pik-PlbkTYjbW5WmVdBJj3MMdVEAldar-zMnn1WxM6Gn7E4lx1Dn3P0kkB4MyqczWUc5cPNcuLu7-ZECTYnPkE3cBgoD_7s"]},
    {"name": "Bhandardara", "category": "Nature", "state": "Maharashtra", "country": "India",
     "latitude": 19.5400, "longitude": 73.7500,
     "photos": ["https://lh3.googleusercontent.com/aida-public/AB6AXuBsomkP2rDarf2KzApFgzh-7dVwztMAwWnHOhJGWO2BtjrR7-69YNDiIKfSZOdLfjVajdaNmr2AomDz5h6EkcyMh-UyDySaqoE8RWNPJgFiaHMdp7MSfWqGZwh09lymygxH-w5OYCmwrvftOOQVEgzv9fn1AZj75NFG9Qw_JU-kFExd6xfTQfT7W28n52Va4wXnh32vJuPXj_-J88fv2AyRnburB7ZNU9t5LglNUmXShLntmrx76TxH"]},
]

def seed_places(db: Session) -> None:
    if db.query(Place).first() is not None:
        return  # already seeded

    logger.info("Seeding %d places...", len(SEED_PLACES))
    for data in SEED_PLACES:
        db.add(Place(**data))
    db.commit()
