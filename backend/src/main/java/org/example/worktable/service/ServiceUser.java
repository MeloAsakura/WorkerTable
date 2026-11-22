package org.example.worktable.service;


import org.example.worktable.model.User;
import org.example.worktable.repository.user.UserRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ServiceUser {

    private final UserRepo repository;

    public ServiceUser(UserRepo repository){ this.repository=repository;}

//    public User login(String email,String password){
//        User user= UserRepo;
//
//        if(user==null){
//            throw new IllegalArgumentException("Usuario nao encontrado");
//        }
//        if(!passwordEncoder.matches(password,user.getPassword())){
//            throw new IllegalArgumentException("Senha inválida.");
//        }
//        return user;
//    }

    public User createUser(User user) {

        if (user == null) {
            throw new IllegalArgumentException("É necessário se cadastrar.");
        }

        if (user.getFirtsName() == null
                || user.getEmail() == null
                || user.getPassword() == null) {

            throw new IllegalArgumentException(
                    "Nome, email e senha são obrigatórios."
            );
        }

        repository.insertUser(user);

        return user;
    }

    public List<User> grupoDeTarefa(User user){
        List<User>grupoTarefa=new ArrayList<>();
        if(user==null){
            throw new IllegalArgumentException("Usuario nao encontrado");
        }
        if(grupoTarefa.contains(user)){
            throw new IllegalArgumentException("Usuario ja no grupo de trabalho");
        }
        grupoTarefa.add(user);
        return grupoTarefa;
    }
   // public void deleteUserByName(String name){
      //  if(name.isBlank()){
         //   throw new IllegalArgumentException("Sem usuarios para deletar");
      //  }
        //const repoUser

      //  )
   // }

}
