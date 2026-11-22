package org.example.worktable.repository.user;



import org.example.connection.ConnectionFactory;
import org.example.worktable.model.User;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;


@Repository
public final class UserRepo {


    public void insertUser(User user) {

        String sql = """
            INSERT INTO USUARIO
            (EMAIL, SENHA, FIRST_NAME, LAST_NAME)
            VALUES (?, ?, ?, ?)
            """;

        try (
                Connection conn = ConnectionFactory.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)
        ) {

            stmt.setString(1, user.getEmail());
            stmt.setString(2, user.getPassword());
            stmt.setString(3, user.getFirtsName());
            stmt.setString(4, user.getLastname());

            int i = stmt.executeUpdate();

            if (i > 0) {
                System.out.println("Usuário adicionado");
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public User checkEmail(String email) {
        String sql = """
                SELECT ID, LOGIN, EMAIL, SENHA
                FROM USUARIO
                WHERE EMAIL = ?
                """;

        if (email.isBlank() || email.isEmpty()) {
            throw new IllegalArgumentException("Email incorreto");
        }

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = User.builder()
                            .email(rs.getString("EMAIL"))
                            .build();
                    return user;
                }
                return null;
            }

        } catch (SQLException e) {
            throw new RuntimeException(e);
        }

    }

    public int inativeUser(User user) throws SQLException {

        String sql = """
                UPDATE USER
                SET ATIVO = FALSE
                WHERE ATIVO = TRUE AND ID = ?
                """;
        int rowsAffected = 0;

        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user.getId());

            rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new IllegalArgumentException("Nao foi deletado");
            }
        }
        return rowsAffected;
    }

    public int deleteUser(User user) throws SQLException {
        String sql = """
                DELETE FROM USER WHERE ID=?
                """;
        int rowsAffected = 0;
        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, user.getId());
            stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new IllegalArgumentException("Nao foi deletado");
            }
        }
        return rowsAffected;
    }

    public User findById(Long id) throws SQLException {
        String sql = """
                SELECT ID,FIRTS_NAME,LAST_NAME,EMAIL FROM USER WHERE ID=? AND ATIVO=TRUE;
                """;

        User user=null;


        try (Connection conn = ConnectionFactory.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setLong(1, id);


            try (ResultSet rs = stmt.executeQuery()) {

                if (rs.next()) {
                  Long UserId=  rs.getLong("ID");
                  String FirtsName= rs.getString("FIRTS_NAME");
                  String LastName=  rs.getString("LAST_NAME");
                  String email= rs.getString("EMAIL");

                    user = User.builder()
                            .id(UserId)
                            .FirtsName(FirtsName)
                            .Lastname(LastName)
                            .email(email)
                            .build();
                }
            }
        }
        return user;
    }
}
