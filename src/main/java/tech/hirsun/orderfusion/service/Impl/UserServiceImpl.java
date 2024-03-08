package tech.hirsun.orderfusion.service.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tech.hirsun.orderfusion.dao.UserDao;
import tech.hirsun.orderfusion.pojo.PageBean;
import tech.hirsun.orderfusion.pojo.User;
import tech.hirsun.orderfusion.service.UserService;
import tech.hirsun.orderfusion.utils.HashUtil;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserDao userDao;
    public User login(User user) {
        User dbUser = userDao.getUserByEmail(user.getEmail());
        if (dbUser == null) {
            return null;
        }

        String saltedPassword = HashUtil.formPlainPassToDBPass(user.getPassword(), dbUser.getRandomSalt());

        if(dbUser.getPassword().equals(saltedPassword)) {
            return new User(dbUser.getName(), dbUser.getEmail(), dbUser.getAvatarUri(), dbUser.getIsAdmin());
        }else {
            return null;
        }
    }

    @Override
    public User getUserInfo(Integer id) {
        return userDao.getUserById(id);
    }

    public void update(User user) {
        User draftUser = new User();
        draftUser.setId(user.getId());

        if (user.getName() != null){
            if (user.getName().length() > 0){
                draftUser.setName(user.getName());
            }
        }

        if (user.getPassword() != null){
            if (user.getPassword().length() > 0){
                draftUser.setPassword(user.getPassword());
            }
        }

        if (user.getEmail() != null){
            if (user.getEmail().length() > 0){
                draftUser.setEmail(user.getEmail());
            }
        }
        userDao.update(draftUser);
    }

    @Override
    public PageBean page(int pageNum, int pageSize, String keyword) {
        int count = userDao.count();

        int start = (pageNum-1) * pageSize;
        List<User> users = userDao.list(start, pageSize, keyword);

        return new PageBean(count, users,Math.floorDiv(count, pageSize) + 1, pageNum);
    }

    @Override
    public void add(User user) {
        userDao.insert(user);
    }

    @Override
    public void lockSwitch(User user) {
        if (user.getIsFrozen() == 0) {
            user.setIsFrozen(1);
        } else {
            user.setIsFrozen(0);
        }
        userDao.update(user);
    }


}
